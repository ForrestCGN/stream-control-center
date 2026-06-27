const fs = require("fs");
const http = require("http");
const net = require("net");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const tempRoot = path.resolve(os.tmpdir());
const smokeRoot = fs.mkdtempSync(path.join(tempRoot, "scc-smoke-"));

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function getFreePort() {
  const server = net.createServer();

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  const port = address && typeof address === "object" ? address.port : null;

  await new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });

  if (!Number.isInteger(port)) throw new Error("Could not allocate a smoke-test port");
  return port;
}

function requestStatus(port) {
  return new Promise((resolve, reject) => {
    const request = http.get({
      hostname: "127.0.0.1",
      port,
      path: "/api/_status",
      timeout: 750
    }, response => {
      let body = "";

      response.setEncoding("utf8");
      response.on("data", chunk => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode !== 200) {
          reject(new Error(`Status endpoint returned HTTP ${response.statusCode}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`Status endpoint returned invalid JSON: ${error.message}`));
        }
      });
    });

    request.on("timeout", () => request.destroy(new Error("Status request timed out")));
    request.on("error", reject);
  });
}

async function waitForStatus(child, port) {
  const deadline = Date.now() + 10000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Server exited before the status check (code ${child.exitCode})`);
    }

    try {
      return await requestStatus(port);
    } catch {
      await delay(150);
    }
  }

  throw new Error("Server did not answer the status check within 10 seconds");
}

async function stopChild(child) {
  if (child.exitCode !== null) return;

  const exited = new Promise(resolve => child.once("exit", resolve));
  child.kill();
  await Promise.race([exited, delay(3000)]);

  if (child.exitCode === null) {
    child.kill("SIGKILL");
    await Promise.race([exited, delay(3000)]);
  }
}

function createChildEnvironment(port) {
  const environment = {};
  const inheritedKeys = [
    "PATH",
    "Path",
    "SystemRoot",
    "SYSTEMROOT",
    "WINDIR",
    "TEMP",
    "TMP",
    "HOME",
    "USERPROFILE"
  ];

  for (const key of inheritedKeys) {
    if (process.env[key]) environment[key] = process.env[key];
  }

  return {
    ...environment,
    NODE_ENV: "test",
    PORT: String(port),
    STREAM_ASSETS_ROOT: smokeRoot
  };
}

function assertStatus(status, port) {
  if (!status || status.ok !== true) throw new Error("Status response is not healthy");
  if (status.port !== port) throw new Error(`Expected port ${port}, received ${status.port}`);
  if (path.resolve(status.rootDir) !== smokeRoot) throw new Error("Server used the wrong root directory");
  if (!Array.isArray(status.modules) || status.modules.length !== 0) {
    throw new Error("Smoke server unexpectedly loaded modules");
  }

  const duplicates = status.routeDiagnostics && status.routeDiagnostics.duplicateRoutes;
  if (!Array.isArray(duplicates) || duplicates.length !== 0) {
    throw new Error("Smoke server reported duplicate core routes");
  }
}

async function main() {
  fs.mkdirSync(path.join(smokeRoot, "backend", "modules"), { recursive: true });
  fs.mkdirSync(path.join(smokeRoot, "htdocs"), { recursive: true });

  const port = await getFreePort();
  const child = spawn(process.execPath, [path.join(projectRoot, "backend", "server.js")], {
    cwd: projectRoot,
    env: createChildEnvironment(port),
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", chunk => {
    stdout += chunk;
  });
  child.stderr.on("data", chunk => {
    stderr += chunk;
  });

  try {
    const status = await waitForStatus(child, port);
    assertStatus(status, port);
    console.log(`Server smoke test passed on isolated port ${port}.`);
  } catch (error) {
    if (stdout) process.stderr.write(`\nServer stdout:\n${stdout}`);
    if (stderr) process.stderr.write(`\nServer stderr:\n${stderr}`);
    throw error;
  } finally {
    await stopChild(child);
  }
}

main()
  .catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
  })
  .finally(() => {
    const resolvedSmokeRoot = path.resolve(smokeRoot);
    const isSafeTempPath = resolvedSmokeRoot.startsWith(`${tempRoot}${path.sep}`)
      && path.basename(resolvedSmokeRoot).startsWith("scc-smoke-");

    if (!isSafeTempPath) {
      console.error(`Refusing to remove unsafe smoke-test path: ${resolvedSmokeRoot}`);
      process.exitCode = 1;
      return;
    }

    fs.rmSync(resolvedSmokeRoot, { recursive: true, force: true });
  });
