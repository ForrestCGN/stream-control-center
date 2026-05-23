#!/usr/bin/env node
'use strict';

/**
 * STEP274W FIX4 - Birthday import-media route hard repair
 *
 * Repariert einen teilweisen STEP274W-Stand:
 * - entfernt versehentlich in handleBirthdayAssetUpload verschachtelten importBirthdayMediaAsset-Block
 * - setzt importBirthdayMediaAsset als Top-Level-Funktion
 * - registriert POST /api/birthday/admin/show/import-media wirklich im Runtime-Router
 * - laeuft idempotent und prueft danach die wichtigsten Marker
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const backendFile = path.join(ROOT, 'backend', 'modules', 'birthday.js');

function read(file) {
  if (!fs.existsSync(file)) throw new Error('file_missing:' + file);
  return fs.readFileSync(file, 'utf8');
}
function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}
function log(msg) { console.log('[STEP274W_FIX4]', msg); }
function has(content, needle) { return content.indexOf(needle) !== -1; }

let src = read(backendFile);
let changed = false;

// 1) Defekten verschachtelten Import-Block aus handleBirthdayAssetUpload entfernen.
const nestedStart = "\n// STEP274W importBirthdayMediaAsset\nasync function importBirthdayMediaAsset(payload = {}) {";
const nestedIdx = src.indexOf(nestedStart);
if (nestedIdx >= 0) {
  const resumeNeedle = "\n\n  if (!file || !file.buffer || !file.originalname) throw new Error('upload_file_missing');";
  const resumeIdx = src.indexOf(resumeNeedle, nestedIdx);
  if (resumeIdx < 0) throw new Error('nested_import_resume_marker_not_found');
  src = src.slice(0, nestedIdx) + src.slice(resumeIdx);
  changed = true;
  log('removed nested importBirthdayMediaAsset block');
}

// 2) Top-Level Import-Funktion setzen.
const topLevelMarker = '// STEP274W_FIX4 importBirthdayMediaAsset top-level';
const importFunction = `

${topLevelMarker}
async function importBirthdayMediaAsset(payload = {}) {
  const kind = clean(payload.kind || payload.type || '');
  const mediaId = Number(payload.mediaId || payload.media_id || payload.id || 0);
  if (!mediaId) throw new Error('media_id_required');

  const asset = database.get('SELECT * FROM media_assets WHERE id = :id AND status = :status LIMIT 1', { id: mediaId, status: 'active' });
  if (!asset) throw new Error('media_asset_not_found');

  const sourceAbs = path.resolve(asset.absolute_path || '');
  if (!sourceAbs || !fs.existsSync(sourceAbs)) throw new Error('media_asset_file_missing');

  const ext = path.extname(asset.file_name || sourceAbs).toLowerCase();
  if (!assertUploadAllowed(kind, ext)) throw new Error(\`upload_extension_not_allowed:\${ext || 'missing'}\`);

  const cfg = getConfig();
  const uploadDirName = sanitizeUploadBase(cfg.show?.uploadDir || 'birthday');
  const targetDir = config.resolveFromSounds(uploadDirName);
  fs.mkdirSync(targetDir, { recursive: true });

  const login = payload.login || payload.userLogin || payload.username || '';
  const targetFileName = birthdayUploadFileName(kind, login, asset.file_name || path.basename(sourceAbs));
  const targetPath = uniqueBirthdayAssetPath(targetDir, targetFileName);
  fs.copyFileSync(sourceAbs, targetPath);

  const relativePath = \`${'${uploadDirName}'}/\${path.basename(targetPath)}\`.replace(/\\\\/g, '/');
  const mediaInfo = mediaInfoForSoundFile(relativePath, 0);
  const reference = await updateBirthdayShowUploadReference(kind, relativePath, mediaInfo, payload);

  return {
    ok: true,
    module: MODULE_NAME,
    step: 'STEP274W_FIX4',
    message: 'Birthday-Medium wurde übernommen.',
    kind,
    source: 'media_registry',
    mediaId,
    sourceAsset: {
      id: Number(asset.id),
      displayName: asset.display_name || '',
      fileName: asset.file_name || '',
      relativePath: asset.relative_path || '',
      webPath: asset.web_path || ''
    },
    fileName: path.basename(targetPath),
    relativePath,
    webPath: \`/assets/sounds/\${relativePath}\`,
    mediaInfo,
    reference,
    user: reference.login ? getBirthdayUser(reference.login) : null,
    profile: reference.login ? getBirthdayShowProfile(reference.login) : null,
    assets: buildBirthdayShowAssets(),
    status: buildStatus()
  };
}
`;
if (!has(src, topLevelMarker)) {
  const marker = '\nasync function handleBirthdayAssetUpload(payload = {}, file = null) {';
  const idx = src.indexOf(marker);
  if (idx < 0) throw new Error('handleBirthdayAssetUpload_marker_not_found');
  src = src.slice(0, idx) + importFunction + src.slice(idx);
  changed = true;
  log('inserted top-level importBirthdayMediaAsset');
}

// 3) Route wirklich registrieren. Route-Liste allein reicht nicht.
const routeNeedle = "`${API_PREFIX}/admin/show/import-media`], core.asyncRoute";
if (!has(src, routeNeedle)) {
  const uploadRoute = `  routes.registerPost(app, [\`${'${API_PREFIX}'}/admin/show/upload\`], core.asyncRoute(async (req, res) => {\n    try { return res.json(await handleBirthdayAssetUpload(req.body || {}, req.file || null)); }\n    catch (err) { return res.status(400).json({ ok: false, error: err.message || String(err) }); }\n  }), upload.single('file'));`;
  const idx = src.indexOf(uploadRoute);
  if (idx < 0) throw new Error('upload_route_marker_not_found');
  const insertAfter = idx + uploadRoute.length;
  const route = `

  // STEP274W_FIX4 - Media-Registry Asset kontrolliert ins Birthday-/Sound-System übernehmen.
  routes.registerPost(app, [\`${'${API_PREFIX}'}/admin/show/import-media\`], core.asyncRoute(async (req, res) => {
    try { return res.json(await importBirthdayMediaAsset(req.body || req.query || {})); }
    catch (err) { return res.status(400).json({ ok: false, error: err.message || String(err) }); }
  }));`;
  src = src.slice(0, insertAfter) + route + src.slice(insertAfter);
  changed = true;
  log('registered POST /api/birthday/admin/show/import-media');
}

// 4) Defektes STEP274W-Tool zu Stub machen, damit es nicht erneut halb patcht.
const oldTool = path.join(ROOT, 'tools', 'apply_step274w_birthday_mediapicker_import.js');
if (fs.existsSync(oldTool)) {
  const stub = `#!/usr/bin/env node\n'use strict';\nconsole.log(JSON.stringify({ ok: true, step: 'STEP274W', note: 'Dieses Tool wurde durch STEP274W_FIX4 ersetzt. Bitte nicht erneut verwenden.' }, null, 2));\n`;
  const cur = read(oldTool);
  if (!cur.includes('durch STEP274W_FIX4 ersetzt')) {
    write(oldTool, stub);
    log('replaced old partial STEP274W tool with stub');
  }
}

if (changed) write(backendFile, src);

const finalSrc = read(backendFile);
const checks = {
  topLevelFunction: has(finalSrc, topLevelMarker),
  routeRegistered: has(finalSrc, routeNeedle),
  routeListed: has(finalSrc, "${API_PREFIX}/admin/show/import-media"),
  nestedRemoved: finalSrc.indexOf(nestedStart) < 0
};
const ok = Object.values(checks).every(Boolean);
console.log(JSON.stringify({ ok, step: 'STEP274W_FIX4', changed, patched: ['backend/modules/birthday.js', 'tools/apply_step274w_birthday_mediapicker_import.js'], checks }, null, 2));
if (!ok) process.exit(1);
