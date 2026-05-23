/* STEP274W FIX2 - Birthday MediaPicker import backend route + frontend error handling
 * Ziel:
 * - POST /api/birthday/admin/show/import-media wirklich registrieren
 * - Import-Funktion top-level verfuegbar machen
 * - Frontend-Hinweis bei Fehlern sauber zuruecksetzen
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const backendFile = path.join(root, 'backend', 'modules', 'birthday.js');
const dashboardFile = path.join(root, 'htdocs', 'dashboard', 'modules', 'birthday.js');

function read(file) {
  if (!fs.existsSync(file)) throw new Error('file_not_found: ' + file);
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function patchBackend() {
  let src = read(backendFile);

  const fnName = 'importBirthdayMediaAssetFromRegistry';

  if (!src.includes(`async function ${fnName}`)) {
    const marker = '\nasync function handleBirthdayAssetUpload(payload = {}, file = null) {';
    if (!src.includes(marker)) throw new Error('backend_handle_upload_marker_not_found');

    const importFn = `
// STEP274W_FIX2 - top-level Media-Registry Import fuer Birthday-Show
async function ${fnName}(payload = {}) {
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

  const relativePath = \`\${uploadDirName}/\${path.basename(targetPath)}\`.replace(/\\\\/g, '/');
  const mediaInfo = mediaInfoForSoundFile(relativePath, 0);
  const reference = await updateBirthdayShowUploadReference(kind, relativePath, mediaInfo, payload);

  return {
    ok: true,
    module: MODULE_NAME,
    step: 'STEP274W_FIX2',
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
    status: buildStatus(),
    message: 'Birthday-Medium wurde übernommen.'
  };
}

`;
    src = src.replace(marker, importFn + marker);
    console.log('[patch] backend top-level import function inserted');
  } else {
    console.log('[skip] backend top-level import function already present');
  }

  // Register route if not actually registered.
  const routePath = '${API_PREFIX}/admin/show/import-media';
  const hasRealRoute = src.includes("importBirthdayMediaAssetFromRegistry(req.body") || src.includes("importBirthdayMediaAssetFromRegistry(req.query");
  if (!hasRealRoute) {
    const uploadRouteBlock = `routes.registerPost(app, [\`${'${API_PREFIX}'}/admin/show/upload\`], core.asyncRoute(async (req, res) => {
    try { return res.json(await handleBirthdayAssetUpload(req.body || {}, req.file || null)); }
    catch (err) { return res.status(400).json({ ok: false, error: err.message || String(err) }); }
  }), upload.single('file'));`;
    if (!src.includes(uploadRouteBlock)) throw new Error('backend_upload_route_block_not_found');

    const importRoute = `${uploadRouteBlock}

  // STEP274W_FIX2 - Media-Registry Asset in Birthday-/Sound-System uebernehmen
  routes.registerPost(app, [\`${'${API_PREFIX}'}/admin/show/import-media\`], core.asyncRoute(async (req, res) => {
    try { return res.json(await importBirthdayMediaAssetFromRegistry(req.body || req.query || {})); }
    catch (err) { return res.status(400).json({ ok: false, error: err.message || String(err) }); }
  }));`;

    src = src.replace(uploadRouteBlock, importRoute);
    console.log('[patch] backend import-media route registered');
  } else {
    console.log('[skip] backend import-media route already registered');
  }

  // Remove the broken nested function copy if present to avoid confusion.
  const nestedStart = src.indexOf('\n// STEP274W importBirthdayMediaAsset\nasync function importBirthdayMediaAsset(payload = {}) {');
  if (nestedStart >= 0) {
    const afterStart = nestedStart + 1;
    const handleRemainderMarker = '\n\n  if (!file || !file.buffer || !file.originalname) throw new Error(\'upload_file_missing\');';
    const nestedEnd = src.indexOf(handleRemainderMarker, nestedStart);
    if (nestedEnd > nestedStart) {
      src = src.slice(0, nestedStart) + src.slice(nestedEnd);
      console.log('[patch] removed broken nested import function copy');
    }
  }

  write(backendFile, src);
}

function patchDashboard() {
  let src = read(dashboardFile);

  // Clear stale green notice on import error and produce cleaner error text.
  const oldCatch = `        } catch (err) {
          state.error = err.message || String(err);
          render();
        }`;
  const newCatch = `        } catch (err) {
          state.notice = '';
          state.error = err.message || String(err);
          render();
        }`;
  if (src.includes(oldCatch)) {
    src = src.replace(oldCatch, newCatch);
    console.log('[patch] dashboard import error clears notice');
  } else {
    console.log('[skip] dashboard catch block already patched or not found');
  }

  // Ensure import-media exists in api object.
  if (!src.includes("importMedia: '/api/birthday/admin/show/import-media'")) {
    const marker = "resolveUser: '/api/birthday/admin/resolve-user'";
    if (!src.includes(marker)) throw new Error('dashboard_api_marker_not_found');
    src = src.replace(marker, marker + ",\n    importMedia: '/api/birthday/admin/show/import-media'");
    console.log('[patch] dashboard api.importMedia added');
  } else {
    console.log('[skip] dashboard api.importMedia exists');
  }

  write(dashboardFile, src);
}

patchBackend();
patchDashboard();

console.log(JSON.stringify({
  ok: true,
  step: 'STEP274W_FIX2',
  patched: [
    'backend/modules/birthday.js',
    'htdocs/dashboard/modules/birthday.js'
  ],
  note: 'Bitte danach stepdone ausfuehren, Backend neu starten falls noetig und im Browser Strg+F5 nutzen.'
}, null, 2));
