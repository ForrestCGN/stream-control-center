const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const target = path.join(repoRoot, 'htdocs', 'overlays', 'vip_sound_overlay_v2.html');
const step = 'STEP399';

function fail(message) {
  console.error(`${step}_ERROR=${message}`);
  process.exit(1);
}

if (!fs.existsSync(target)) fail(`target_not_found:${target}`);

let html = fs.readFileSync(target, 'utf8');

if (html.includes('clientId: "vip_sound_overlay_v2"') && html.includes('mode: "shadow"') && html.includes('sendVipBusShadowHello')) {
  console.log(`${step}_PATCH=already_applied`);
  process.exit(0);
}

const backup = `${target}.step399_${new Date().toISOString().replace(/[:.]/g, '-')}.bak`;
fs.writeFileSync(backup, html, 'utf8');

const helperMarker = `    function connectWs() {`;
const helperInsert = `    function sendVipBusShadowHello() {\n      if (!ws || ws.readyState !== WebSocket.OPEN) return;\n      try {\n        ws.send(JSON.stringify({\n          type: "bus_hello",\n          clientId: "vip_sound_overlay_v2",\n          clientType: "overlay",\n          module: "vip_sound_overlay",\n          mode: "shadow",\n          capabilities: ["vip.overlay.show", "vip.overlay.hide", "vip.overlay.update", "ack"],\n          version: "STEP399"\n        }));\n      } catch (_) {}\n    }\n\n` + helperMarker;

if (!html.includes(helperMarker)) fail('connectWs_marker_not_found');
html = html.replace(helperMarker, helperInsert);

const openBlock = `      ws.addEventListener("open", () => {\n        setDebug(["VIP V2 WS open", "host=" + location.host]);\n      });`;
const openReplacement = `      ws.addEventListener("open", () => {\n        sendVipBusShadowHello();\n        setDebug(["VIP V2 WS open", "host=" + location.host, "busShadow=vip_sound_overlay_v2"]);\n      });`;

if (!html.includes(openBlock)) fail('ws_open_block_not_found');
html = html.replace(openBlock, openReplacement);

fs.writeFileSync(target, html, 'utf8');
console.log(`${step}_PATCH=applied`);
console.log(`backup=${backup}`);
console.log('target=htdocs/overlays/vip_sound_overlay_v2.html');
console.log('NOTE=Reload the OBS VIP overlay/browser source after applying this patch.');
