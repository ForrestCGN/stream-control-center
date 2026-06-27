const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(projectRoot, "src");

function collectJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) return collectJavaScriptFiles(entryPath);
      return entry.isFile() && entry.name.endsWith(".js") ? [entryPath] : [];
    })
    .sort();
}

const files = [
  path.join(projectRoot, "server.js"),
  ...collectJavaScriptFiles(sourceRoot)
];

let hasErrors = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8"
  });

  if (result.status === 0) continue;

  hasErrors = true;
  process.stderr.write(result.stderr || result.stdout || `Syntax check failed: ${file}\n`);
}

if (hasErrors) process.exit(1);

console.log(`Syntax check passed for ${files.length} backend files.`);
