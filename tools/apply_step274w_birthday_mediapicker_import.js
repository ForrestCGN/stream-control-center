'use strict';

/**
 * STEP274W - Birthday: zentrale MediaPicker-Uploads in Show/Medien verwenden
 *
 * Patcht:
 * - backend/modules/birthday.js: Media-Registry Asset per mediaId in Birthday-Soundordner importieren
 * - htdocs/dashboard/modules/birthday.js: Show/Medien öffnet MediaPicker statt direkter File-Felder
 * - htdocs/dashboard/modules/birthday.css: kleine UI-Ergänzungen
 */

const fs = require('fs');
const path = require('path');

const repo = process.cwd();
const backendFile = path.join(repo, 'backend', 'modules', 'birthday.js');
const dashboardFile = path.join(repo, 'htdocs', 'dashboard', 'modules', 'birthday.js');
const cssFile = path.join(repo, 'htdocs', 'dashboard', 'modules', 'birthday.css');

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`missing_file:${file}`);
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function patchOnce(content, marker, insertAfterNeedle, insert) {
  if (content.includes(marker)) return content;
  if (!content.includes(insertAfterNeedle)) throw new Error(`needle_missing:${insertAfterNeedle.slice(0, 80)}`);
  return content.replace(insertAfterNeedle, insertAfterNeedle + insert);
}

function patchBackend() {
  let src = read(backendFile);

  src = patchOnce(
    src,
    'STEP274W importBirthdayMediaAsset',
    "async function handleBirthdayAssetUpload(payload = {}, file = null) {",
    `\n\n// STEP274W importBirthdayMediaAsset\nasync function importBirthdayMediaAsset(payload = {}) {\n  const kind = clean(payload.kind || payload.type || '');\n  const mediaId = Number(payload.mediaId || payload.media_id || payload.id || 0);\n  if (!mediaId) throw new Error('media_id_required');\n\n  const asset = database.get('SELECT * FROM media_assets WHERE id = :id AND status = :status LIMIT 1', { id: mediaId, status: 'active' });\n  if (!asset) throw new Error('media_asset_not_found');\n\n  const sourceAbs = path.resolve(asset.absolute_path || '');\n  if (!sourceAbs || !fs.existsSync(sourceAbs)) throw new Error('media_asset_file_missing');\n\n  const ext = path.extname(asset.file_name || sourceAbs).toLowerCase();\n  if (!assertUploadAllowed(kind, ext)) throw new Error(\`upload_extension_not_allowed:\${ext || 'missing'}\`);\n\n  const cfg = getConfig();\n  const uploadDirName = sanitizeUploadBase(cfg.show?.uploadDir || 'birthday');\n  const targetDir = config.resolveFromSounds(uploadDirName);\n  fs.mkdirSync(targetDir, { recursive: true });\n\n  const login = payload.login || payload.userLogin || payload.username || '';\n  const targetFileName = birthdayUploadFileName(kind, login, asset.file_name || path.basename(sourceAbs));\n  const targetPath = uniqueBirthdayAssetPath(targetDir, targetFileName);\n  fs.copyFileSync(sourceAbs, targetPath);\n\n  const relativePath = \`${'${uploadDirName}'}/\${path.basename(targetPath)}\`.replace(/\\\\/g, '/');\n  const mediaInfo = mediaInfoForSoundFile(relativePath, 0);\n  const reference = await updateBirthdayShowUploadReference(kind, relativePath, mediaInfo, payload);\n\n  return {\n    ok: true,\n    module: MODULE_NAME,\n    step: 'STEP274W',\n    kind,\n    source: 'media_registry',\n    mediaId,\n    sourceAsset: {\n      id: Number(asset.id),\n      displayName: asset.display_name || '',\n      fileName: asset.file_name || '',\n      relativePath: asset.relative_path || '',\n      webPath: asset.web_path || ''\n    },\n    fileName: path.basename(targetPath),\n    relativePath,\n    webPath: \`/assets/sounds/\${relativePath}\`,\n    mediaInfo,\n    reference,\n    user: reference.login ? getBirthdayUser(reference.login) : null,\n    profile: reference.login ? getBirthdayShowProfile(reference.login) : null,\n    assets: buildBirthdayShowAssets(),\n    status: buildStatus()\n  };\n}\n\n`
  );

  src = patchOnce(
    src,
    "path: `${API_PREFIX}/admin/show/import-media`",
    "      { method: 'POST', path: `${API_PREFIX}/admin/show/upload` },",
    "\n      { method: 'POST', path: `${API_PREFIX}/admin/show/import-media` },"
  );

  src = patchOnce(
    src,
    "`${API_PREFIX}/admin/show/import-media`",
    "  routes.registerGet(app, [`${API_PREFIX}/admin/show/assets`], (req, res) => {",
    `  routes.registerPost(app, [\`${'${API_PREFIX}'}/admin/show/import-media\`], core.asyncRoute(async (req, res) => {\n    try { return res.json(await importBirthdayMediaAsset(req.body || req.query || {})); }\n    catch (err) { return res.status(400).json({ ok: false, error: err.message || String(err) }); }\n  }));\n\n`
  );

  write(backendFile, src);
  console.log('[patch] backend birthday import-media route');
}

function patchDashboard() {
  let src = read(dashboardFile);

  src = src.replace(
    "    showRecheck: '/api/birthday/admin/show/recheck',\n    showParties:",
    "    showRecheck: '/api/birthday/admin/show/recheck',\n    importMedia: '/api/birthday/admin/show/import-media',\n    showParties:"
  );

  src = patchOnce(
    src,
    'STEP274W openBirthdayShowMediaPicker',
    "  async function uploadAsset(kind) {",
    `\n\n  // STEP274W openBirthdayShowMediaPicker\n  function mediaPickerConfigForBirthdayKind(kind) {\n    const cleanKind = String(kind || '').trim();\n    if (cleanKind === 'intro_video') return {\n      moduleKey: 'birthday',\n      categoryKey: 'intro',\n      allowedTypes: ['video'],\n      title: 'Birthday Intro-Video auswählen oder hochladen'\n    };\n    if (cleanKind === 'default_song') return {\n      moduleKey: 'birthday',\n      categoryKey: 'general',\n      allowedTypes: ['audio'],\n      title: 'Birthday Standardsong auswählen oder hochladen'\n    };\n    return {\n      moduleKey: 'birthday',\n      categoryKey: 'user-songs',\n      allowedTypes: ['audio'],\n      title: 'Birthday User-Song auswählen oder hochladen'\n    };\n  }\n\n  function birthdayMediaKindLabel(kind) {\n    if (kind === 'intro_video') return 'Intro-Video';\n    if (kind === 'default_song') return 'Standardsong';\n    return 'User-Song';\n  }\n\n  function openBirthdayShowMediaPicker(kind) {\n    if (!window.MediaPicker?.open) {\n      state.error = 'MediaPicker ist nicht verfügbar. Bitte Dashboard hart neu laden.';\n      render();\n      return;\n    }\n    const config = mediaPickerConfigForBirthdayKind(kind);\n    window.MediaPicker.open({\n      ...config,\n      onSelect(asset) {\n        importBirthdayShowMedia(kind, asset).catch(err => { state.error = err.message || String(err); render(); });\n      }\n    });\n  }\n\n  async function importBirthdayShowMedia(kind, asset) {\n    if (!asset || !asset.id) throw new Error('Kein Medium ausgewählt.');\n    const payload = { kind, mediaId: asset.id };\n    if (kind === 'user_song') {\n      const login = String(root?.querySelector('[data-birthday-upload-login]')?.value || root?.querySelector('[data-birthday-user-login]')?.value || '').trim();\n      if (!login) throw new Error('Für User-Song bitte zuerst @User oder Twitch-Login angeben.');\n      payload.login = login;\n    }\n    const result = await window.CGN.api(api.importMedia, { method: 'POST', body: JSON.stringify(payload) });\n    state.notice = birthdayMediaKindLabel(kind) + ' aus Medienverwaltung übernommen: ' + (result.relativePath || asset.relativePath || asset.fileName || ('#' + asset.id));\n    await loadAll(true);\n  }\n\n`
  );

  const oldBlock = `        <section class="birthday-card">\n          <h3>Medien hochladen</h3>\n          <div class="birthday-form">\n            <label>Globales Intro-Video<input type="file" data-birthday-upload-file="intro_video" accept="video/webm,video/mp4,video/quicktime"></label>\n            <button type="button" data-birthday-upload="intro_video" disabled class="is-disabled" title="Bitte zuerst eine Datei auswählen.">Intro-Video hochladen</button>\n            <label>Standardsong<input type="file" data-birthday-upload-file="default_song" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4"></label>\n            <button type="button" data-birthday-upload="default_song" disabled class="is-disabled" title="Bitte zuerst eine Datei auswählen.">Standardsong hochladen</button>\n            <label>User für eigenen Song<input type="text" data-birthday-upload-login placeholder="@Araglor"></label>\n            <label>User-Song<input type="file" data-birthday-upload-file="user_song" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4"></label>\n            <button type="button" data-birthday-upload="user_song" disabled class="is-disabled" title="Bitte zuerst eine Datei auswählen.">User-Song hochladen</button>\n          </div>\n          <p class="birthday-note">Dateinamen werden automatisch sauber gesetzt: <code>birthday_intro_video.webm</code>, <code>birthday_default_song.mp3</code>, <code>birthday_song_araglor.mp3</code>.</p>\n        </section>`;

  const newBlock = `        <section class="birthday-card birthday-media-picker-card">\n          <h3>Medien über zentrale Medienverwaltung</h3>\n          <p class="birthday-note">Uploads laufen hier über den MediaPicker. Das ausgewählte Medium wird danach automatisch in das Birthday-/Sound-System übernommen.</p>\n          <div class="birthday-media-picker-actions">\n            <button type="button" data-birthday-media-picker="intro_video">🎬 Intro-Video auswählen / hochladen</button>\n            <button type="button" data-birthday-media-picker="default_song">🔊 Standardsong auswählen / hochladen</button>\n          </div>\n          <div class="birthday-form birthday-media-user-song">\n            <label>User für eigenen Song<input type="text" data-birthday-upload-login placeholder="@Araglor"></label>\n            <button type="button" data-birthday-media-picker="user_song">🔊 User-Song auswählen / hochladen</button>\n          </div>\n          <details class="birthday-legacy-upload">\n            <summary>Legacy-Direktupload anzeigen</summary>\n            <div class="birthday-form">\n              <label>Globales Intro-Video<input type="file" data-birthday-upload-file="intro_video" accept="video/webm,video/mp4,video/quicktime"></label>\n              <button type="button" data-birthday-upload="intro_video" disabled class="is-disabled" title="Bitte zuerst eine Datei auswählen.">Intro-Video direkt hochladen</button>\n              <label>Standardsong<input type="file" data-birthday-upload-file="default_song" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4"></label>\n              <button type="button" data-birthday-upload="default_song" disabled class="is-disabled" title="Bitte zuerst eine Datei auswählen.">Standardsong direkt hochladen</button>\n              <label>User-Song<input type="file" data-birthday-upload-file="user_song" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4"></label>\n              <button type="button" data-birthday-upload="user_song" disabled class="is-disabled" title="Bitte zuerst eine Datei auswählen.">User-Song direkt hochladen</button>\n            </div>\n          </details>\n        </section>`;

  if (src.includes(oldBlock)) {
    src = src.replace(oldBlock, newBlock);
  } else if (!src.includes('data-birthday-media-picker="intro_video"')) {
    throw new Error('renderShow_upload_block_not_found');
  }

  src = patchOnce(
    src,
    "[data-birthday-media-picker]",
    "    root?.querySelector('[data-birthday-recheck-assets]')?.addEventListener('click', () => recheckShowAssets().catch(err => { state.error = err.message; render(); }));",
    "\n    root?.querySelectorAll('[data-birthday-media-picker]').forEach(btn => btn.addEventListener('click', () => openBirthdayShowMediaPicker(btn.dataset.birthdayMediaPicker || '')));"
  );

  write(dashboardFile, src);
  console.log('[patch] dashboard birthday MediaPicker integration');
}

function patchCss() {
  let css = read(cssFile);
  if (!css.includes('STEP274W birthday media picker card')) {
    css += `\n\n/* STEP274W birthday media picker card */\n.birthday-media-picker-card{border-color:rgba(64,232,255,.24);background:linear-gradient(135deg,rgba(12,20,42,.78),rgba(30,16,52,.70))}\n.birthday-media-picker-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}\n.birthday-media-picker-actions button,.birthday-media-user-song button{min-height:44px;font-weight:900}\n.birthday-media-user-song{margin-top:10px}\n.birthday-legacy-upload{margin-top:14px;border:1px dashed rgba(255,255,255,.16);border-radius:14px;padding:10px;background:rgba(0,0,0,.14)}\n.birthday-legacy-upload summary{cursor:pointer;color:var(--muted);font-weight:800}\n.birthday-legacy-upload[open] summary{margin-bottom:10px}\n@media(max-width:1000px){.birthday-media-picker-actions{grid-template-columns:1fr}}\n`;
    write(cssFile, css);
    console.log('[patch] dashboard birthday MediaPicker css');
  } else {
    console.log('[patch] dashboard birthday MediaPicker css already present');
  }
}

patchBackend();
patchDashboard();
patchCss();
console.log(JSON.stringify({ ok: true, step: 'STEP274W', patched: [
  'backend/modules/birthday.js',
  'htdocs/dashboard/modules/birthday.js',
  'htdocs/dashboard/modules/birthday.css'
] }, null, 2));
