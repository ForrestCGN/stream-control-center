'use strict';

/**
 * STEP274W FIX3 - Birthday import-media runtime route fix
 *
 * Repariert den teilweise angewendeten STEP274W-Stand:
 * - importBirthdayMediaAsset darf nicht innerhalb von handleBirthdayAssetUpload verschachtelt sein.
 * - POST /api/birthday/admin/show/import-media wird sicher registriert.
 * - defekte alte STEP274W/FIX2 Apply-Tools werden zu sicheren Stubs gemacht.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const backendFile = path.join(repoRoot, 'backend', 'modules', 'birthday.js');
const docsDir = path.join(repoRoot, 'docs', 'dashboard');
const stateDir = path.join(repoRoot, 'project-state');
const currentDoc = path.join(repoRoot, 'docs', 'current', 'CURRENT_SYSTEM_STATUS.md');

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`file_missing:${file}`);
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function replaceToolWithStub(relPath, step) {
  const file = path.join(repoRoot, relPath);
  if (!fs.existsSync(file)) return false;
  write(file, `'use strict';\nconsole.log(JSON.stringify({ ok: true, step: '${step}', skipped: true, note: 'Dieses alte Patch-Tool wurde durch STEP274W_FIX3 ersetzt und macht nichts mehr.' }, null, 2));\n`);
  return true;
}

const importFunction = `
// STEP274W_FIX3_IMPORT_MEDIA_ROUTE
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
    step: 'STEP274W_FIX3',
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
    message: 'Birthday-Medium wurde übernommen.',
    user: reference.login ? getBirthdayUser(reference.login) : null,
    profile: reference.login ? getBirthdayShowProfile(reference.login) : null,
    assets: buildBirthdayShowAssets(),
    status: buildStatus()
  };
}
`;

const routeBlock = `
  // STEP274W_FIX3_IMPORT_MEDIA_ROUTE
  routes.registerPost(app, [\`${'${API_PREFIX}'}/admin/show/import-media\`], core.asyncRoute(async (req, res) => {
    try { return res.json(await importBirthdayMediaAsset(req.body || req.query || {})); }
    catch (err) { return res.status(400).json({ ok: false, error: err.message || String(err) }); }
  }));
`;

function patchBackend() {
  let src = read(backendFile);

  // Entferne versehentlich in handleBirthdayAssetUpload verschachtelte Import-Funktion aus STEP274W/FIX2.
  const nestedRe = /\n\/\/ STEP274W importBirthdayMediaAsset\s*\nasync function importBirthdayMediaAsset\(payload = \{\}\) \{[\s\S]*?\n\}\n\n\s*(?=if \(!file \|\| !file\.buffer \|\| !file\.originalname\) throw new Error\('upload_file_missing'\);)/;
  if (nestedRe.test(src)) {
    src = src.replace(nestedRe, '\n');
    console.log('[patch] removed nested STEP274W importBirthdayMediaAsset');
  }

  // Entferne ggf. alte top-level Import-Funktion, damit genau eine saubere Version eingesetzt wird.
  const topLevelRe = /\n\/\/ STEP274W_FIX3_IMPORT_MEDIA_ROUTE\s*\nasync function importBirthdayMediaAsset\(payload = \{\}\) \{[\s\S]*?\n\}\n\n(?=async function handleBirthdayAssetUpload)/;
  if (topLevelRe.test(src)) src = src.replace(topLevelRe, '\n');

  const oldTopLevelRe = /\n\/\/ STEP274W importBirthdayMediaAsset\s*\nasync function importBirthdayMediaAsset\(payload = \{\}\) \{[\s\S]*?\n\}\n\n(?=async function handleBirthdayAssetUpload)/;
  if (oldTopLevelRe.test(src)) src = src.replace(oldTopLevelRe, '\n');

  const marker = 'async function handleBirthdayAssetUpload(payload = {}, file = null) {';
  if (!src.includes(marker)) throw new Error('handleBirthdayAssetUpload_marker_missing');
  src = src.replace(marker, `${importFunction}\n${marker}`);
  console.log('[patch] inserted top-level importBirthdayMediaAsset');

  // Entferne ggf. halbe/alte Route und setze Route sicher nach Upload-Route.
  const routeRe = /\n\s*\/\/ STEP274W(?:_FIX\d+)?[^\n]*import[^\n]*\n\s*routes\.registerPost\(app, \[`\$\{API_PREFIX\}\/admin\/show\/import-media`\][\s\S]*?\n\s*\}\)\);\n/gi;
  src = src.replace(routeRe, '\n');
  const uploadRoute = "  routes.registerPost(app, [`${API_PREFIX}/admin/show/upload`], core.asyncRoute(async (req, res) => {\n    try { return res.json(await handleBirthdayAssetUpload(req.body || {}, req.file || null)); }\n    catch (err) { return res.status(400).json({ ok: false, error: err.message || String(err) }); }\n  }), upload.single('file'));";
  if (!src.includes(uploadRoute)) throw new Error('birthday_upload_route_marker_missing');
  src = src.replace(uploadRoute, `${uploadRoute}\n${routeBlock}`);
  console.log('[patch] registered POST /api/birthday/admin/show/import-media');

  write(backendFile, src);
}

function patchDocs() {
  write(path.join(docsDir, 'BIRTHDAY_MEDIAPICKER_IMPORT_FIX3.md'), `# STEP274W FIX3 – Birthday import-media Route Runtime-Fix\n\nDieser Fix repariert den teilweise angewendeten STEP274W-Stand.\n\n## Problem\n\nDas Dashboard konnte den MediaPicker öffnen, aber die Übernahme endete mit:\n\n\`Cannot POST /api/birthday/admin/show/import-media\`\n\nUrsache: Der Import-Helper war durch einen vorherigen Patch versehentlich innerhalb von \`handleBirthdayAssetUpload\` gelandet und die Route wurde nicht sauber registriert.\n\n## Fix\n\n- \`importBirthdayMediaAsset\` liegt wieder top-level im Backend-Modul.\n- \`POST /api/birthday/admin/show/import-media\` wird direkt nach dem Legacy-Upload-Endpunkt registriert.\n- Alte defekte Apply-Tools werden zu sicheren Stubs.\n- Keine DB-Migration.\n- Keine Entfernung bestehender Legacy-Upload-Funktionen.\n\n## Test\n\n1. Backend neu starten.\n2. Dashboard hart neu laden.\n3. Birthday-System → Show/Medien.\n4. User bei User-Song eintragen.\n5. User-Song auswählen.\n6. Nach der Auswahl muss kein \`Cannot POST\` mehr erscheinen.\n`);

  write(path.join(stateDir, 'STEP274W_FIX3.md'), `# STEP274W FIX3 – Birthday import-media Route Runtime-Fix\n\nStatus: vorbereitet\n\n## Änderungen\n\n- Repariert \`backend/modules/birthday.js\`.\n- Registriert \`POST /api/birthday/admin/show/import-media\`.\n- Verschiebt Import-Helper aus falscher Verschachtelung auf Top-Level.\n- Macht alte defekte STEP274W/FIX2-Tools ungefährlich.\n\n## Nach Anwendung\n\n\`node -c backend/modules/birthday.js\` ausführen lassen bzw. über stepdone prüfen.\n`);

  for (const file of [
    path.join(stateDir, 'CURRENT_STATUS.md'),
    path.join(stateDir, 'CHANGELOG.md'),
    path.join(stateDir, 'FILES.md'),
    path.join(stateDir, 'NEXT_STEPS.md'),
    currentDoc
  ]) {
    let content = fs.existsSync(file) ? read(file) : '';
    const note = `\n\n## STEP274W FIX3 – Birthday import-media Route Runtime-Fix\n\n- Repariert die Runtime-Route \`POST /api/birthday/admin/show/import-media\`.\n- MediaPicker-Übernahme im Birthday-Modul soll danach ohne \`Cannot POST\` funktionieren.\n`;
    if (!content.includes('STEP274W FIX3')) content += note;
    write(file, content);
  }
}

patchBackend();
const stubbed = [];
if (replaceToolWithStub('tools/apply_step274w_birthday_mediapicker_import.js', 'STEP274W_REPLACED_BY_FIX3')) stubbed.push('tools/apply_step274w_birthday_mediapicker_import.js');
if (replaceToolWithStub('tools/apply_step274w_fix2_birthday_import_route.js', 'STEP274W_FIX2_REPLACED_BY_FIX3')) stubbed.push('tools/apply_step274w_fix2_birthday_import_route.js');
patchDocs();

console.log(JSON.stringify({
  ok: true,
  step: 'STEP274W_FIX3',
  patched: [
    'backend/modules/birthday.js',
    ...stubbed,
    'docs/dashboard/BIRTHDAY_MEDIAPICKER_IMPORT_FIX3.md',
    'project-state/STEP274W_FIX3.md'
  ],
  next: [
    'node -c backend/modules/birthday.js',
    '.\\stepdone.cmd "STEP274W FIX3 Birthday import-media Route Runtime-Fix"',
    'Backend neu starten',
    'Browser Strg+F5'
  ]
}, null, 2));
