const fs = require('fs');
const path = require('path');

const root = process.cwd();
const soundPath = path.join(root, 'backend', 'modules', 'sound_system.js');
const mediaPath = path.join(root, 'backend', 'modules', 'media.js');

const docsBackend = path.join(root, 'docs', 'backend', 'SOUND_SYSTEM_MEDIAID_DIRECT_STEP275A.md');
const currentPath = path.join(root, 'project-state', 'CURRENT_STATUS.md');
const changelogPath = path.join(root, 'project-state', 'CHANGELOG.md');
const filesPath = path.join(root, 'project-state', 'FILES.md');
const nextPath = path.join(root, 'project-state', 'NEXT_STEPS.md');
const docsCurrentPath = path.join(root, 'docs', 'current', 'CURRENT_SYSTEM_STATUS.md');

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function backup(file, suffix) {
  if (!fs.existsSync(file)) return;
  const bak = `${file}.${suffix}.bak`;
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
}

function appendOnce(file, marker, content) {
  const src = read(file);
  if (src.includes(marker)) return;
  write(file, `${src.trimEnd()}\n\n${content.trim()}\n`);
}

function patchSoundSystem() {
  if (!fs.existsSync(soundPath)) throw new Error(`missing_file:${soundPath}`);
  backup(soundPath, 'step275a');

  let src = read(soundPath);

  const helperMarker = 'function resolveMediaRegistryPayload(body = {})';
  if (!src.includes(helperMarker)) {
    const anchor = `  function browserUrlFromRelative(relativeFile) {
    const clean = String(relativeFile || "").replace(/\\\\/g, "/").replace(/^\\/+/, "");
    return \`/assets/sounds/\${clean}\`;
  }
`;
    if (!src.includes(anchor)) throw new Error('sound_system_browserUrl_anchor_not_found');

    const helper = `${anchor}
  // STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT
  // Erlaubt /api/sound/play und /api/sound/bundle Items mit mediaId/media_id direkt aus der Media-Registry.
  // Dadurch muessen neue Module nicht mehr zwingend nach htdocs/assets/sounds kopieren.
  function assetsBaseDir() {
    if (typeof cfg.getAssetsDir === "function") return cfg.getAssetsDir();
    return cfg.resolveFromRoot("htdocs", "assets");
  }

  function normalizeAssetRelativePath(value) {
    return String(value || "").replace(/\\\\/g, "/").replace(/^\\/+/, "").trim();
  }

  function pathInside(parent, child) {
    const rootPath = path.resolve(parent);
    const targetPath = path.resolve(child);
    const rel = path.relative(rootPath, targetPath);
    return !!rel && !rel.startsWith("..") && !path.isAbsolute(rel) || rel === "";
  }

  function mediaWebPathFromRelative(relativePath, fallbackWebPath) {
    const direct = String(fallbackWebPath || "").trim();
    if (direct) return direct.replace(/\\\\/g, "/");
    const rel = normalizeAssetRelativePath(relativePath);
    return rel ? \`/assets/\${rel}\` : "";
  }

  function mediaTypeFromRegistry(row, info, rawType) {
    const rowType = String(row && row.type || "").toLowerCase();
    if (rowType === "video" || rowType === "animation") return "video";
    if (rowType === "audio") return "audio";
    if (info && info.hasVideo) return "video";
    if (rawType === "video") return "video";
    return "audio";
  }

  function resolveMediaRegistryPayload(body = {}) {
    const mediaId = Number(body.mediaId || body.media_id || body.mediaAssetId || body.assetId || 0);
    const mediaRef = normalizeAssetRelativePath(body.mediaPath || body.mediaRelativePath || body.registryPath || "");
    if (!mediaId && !mediaRef) return null;

    let row = null;
    if (mediaId) {
      row = database.get("SELECT * FROM media_assets WHERE id = :id AND status = :status LIMIT 1", { id: mediaId, status: "active" }) || null;
    } else if (mediaRef) {
      row = database.get("SELECT * FROM media_assets WHERE relative_path = :path AND status = :status LIMIT 1", { path: mediaRef, status: "active" }) || null;
    }
    if (!row) throw new Error(\`Media-Registry Asset wurde nicht gefunden: \${mediaId || mediaRef}\`);

    const assetsDir = assetsBaseDir();
    const relativePath = normalizeAssetRelativePath(row.relative_path || row.relativePath || mediaRef);
    const absolutePath = path.resolve(row.absolute_path || row.absolutePath || path.join(assetsDir, relativePath));
    if (!relativePath) throw new Error("Media-Registry Asset hat keinen relativen Pfad.");
    if (!pathInside(assetsDir, absolutePath)) throw new Error("Media-Registry Asset liegt ausserhalb des Assets-Ordners.");
    if (!fs.existsSync(absolutePath)) throw new Error(\`Media-Registry Datei fehlt: \${relativePath}\`);

    const allowed = Array.isArray(config.allowedExtensions) ? config.allowedExtensions : media.DEFAULT_ALLOWED_EXTENSIONS;
    if (!media.extensionAllowed(absolutePath, allowed)) throw new Error(\`Media-Registry Dateityp ist fuer Sound-System nicht erlaubt: \${path.extname(absolutePath)}\`);

    const info = media.readMediaInfo(absolutePath, {});
    const fallbackDuration = Number(row.duration_ms || row.durationMs || 0);
    if ((!info || !info.durationMs) && fallbackDuration > 0) {
      info.durationMs = fallbackDuration;
      info.durationOk = true;
    }
    if (row.has_audio === 1 || row.hasAudio === true) info.hasAudio = true;
    if (row.has_video === 1 || row.hasVideo === true) info.hasVideo = true;

    const webPath = mediaWebPathFromRelative(relativePath, row.web_path || row.webPath || "");
    return {
      id: Number(row.id || mediaId || 0),
      row,
      relativePath,
      absolutePath,
      webPath,
      info,
      mediaType: mediaTypeFromRegistry(row, info, String(body.mediaType || body.type || "").toLowerCase()),
      label: String(row.display_name || row.displayName || row.file_name || row.fileName || path.basename(relativePath) || "").trim()
    };
  }
`;
    src = src.replace(anchor, helper);
    console.log('[patch] sound_system media registry helper added');
  } else {
    console.log('[skip] sound_system media registry helper already present');
  }

  if (!src.includes('const registryMedia = resolveMediaRegistryPayload(body);')) {
    const anchor = `    let hasVideo = false;
    let videoWidth = 0;
    let videoHeight = 0;

    if (generatedBeep) {`;
    const replacement = `    let hasVideo = false;
    let videoWidth = 0;
    let videoHeight = 0;
    const registryMedia = resolveMediaRegistryPayload(body);

    if (generatedBeep) {`;
    if (!src.includes(anchor)) throw new Error('sound_system_normalizePlayRequest_registry_anchor_not_found');
    src = src.replace(anchor, replacement);
    console.log('[patch] sound_system normalizePlayRequest reads mediaId');
  } else {
    console.log('[skip] sound_system normalizePlayRequest mediaId already wired');
  }

  if (!src.includes('} else if (registryMedia) {')) {
    const anchor = `    } else {
      if (!file) throw new Error(msg("soundFileMissing"));`;
    const replacement = `    } else if (registryMedia) {
      type = "file";
      file = registryMedia.relativePath;
      fullPath = registryMedia.absolutePath;
      mediaInfo = registryMedia.info || {};
      mediaUrl = registryMedia.webPath;
      hasAudio = mediaInfo.hasAudio !== false;
      hasVideo = !!mediaInfo.hasVideo;
      videoWidth = Number(mediaInfo.width || 0);
      videoHeight = Number(mediaInfo.height || 0);
      if (!mediaType || !["audio", "video"].includes(mediaType)) mediaType = registryMedia.mediaType || (hasVideo ? "video" : "audio");
      type = mediaType === "video" ? "video" : rawType;
      if (mediaType === "video") {
        videoUrl = mediaUrl;
      } else {
        audioUrl = mediaUrl;
      }
      base.meta = { ...objectValue(base.meta), mediaRegistry: { id: registryMedia.id, relativePath: registryMedia.relativePath, webPath: registryMedia.webPath, direct: true } };
      if (!base.label && registryMedia.label) base.label = registryMedia.label;
    } else {
      if (!file) throw new Error(msg("soundFileMissing"));`;
    if (!src.includes(anchor)) throw new Error('sound_system_media_branch_anchor_not_found');
    src = src.replace(anchor, replacement);
    console.log('[patch] sound_system direct mediaId branch added');
  } else {
    console.log('[skip] sound_system direct mediaId branch already present');
  }

  write(soundPath, src);
}

function patchMediaModule() {
  if (!fs.existsSync(mediaPath)) throw new Error(`missing_file:${mediaPath}`);
  backup(mediaPath, 'step275a');

  let src = read(mediaPath);

  if (!src.includes('media_registry_direct_mediaid')) {
    const anchor = `  const soundSystemFile = soundSystemFileFor({ ...asset, relativePath: rel });
  const useCase = clean(options.useCase || options.use || '').toLowerCase();
`;
    const replacement = `  const soundSystemFile = soundSystemFileFor({ ...asset, relativePath: rel });
  const mediaRegistryDirect = !soundSystemFile && exists && rel.startsWith('media/') && ['audio', 'video', 'animation'].includes(String(asset.type || '').toLowerCase());
  const useCase = clean(options.useCase || options.use || '').toLowerCase();
`;
    if (!src.includes(anchor)) throw new Error('media_resolve_soundSystemFile_anchor_not_found');
    src = src.replace(anchor, replacement);

    const oldBlock = `    soundSystem: {
      compatible: !!soundSystemFile,
      file: soundSystemFile,
      reason: soundSystemFile ? 'legacy_sounds_relative_path' : 'sound_system_base_dir_not_yet_media_registry_aware'
    },`;
    const newBlock = `    soundSystem: {
      compatible: !!soundSystemFile || !!mediaRegistryDirect,
      file: soundSystemFile,
      mediaIdDirect: !!mediaRegistryDirect,
      reason: soundSystemFile ? 'legacy_sounds_relative_path' : (mediaRegistryDirect ? 'media_registry_direct_mediaid' : 'sound_system_base_dir_not_yet_media_registry_aware')
    },`;
    if (!src.includes(oldBlock)) throw new Error('media_resolve_soundSystem_block_not_found');
    src = src.replace(oldBlock, newBlock);

    const oldUse = `  if (useCase === 'sound_system' || useCase === 'sound') {
    resolved.ok = !!soundSystemFile;
    if (!soundSystemFile) resolved.error = resolved.soundSystem.reason;
  }`;
    const newUse = `  if (useCase === 'sound_system' || useCase === 'sound') {
    resolved.ok = !!soundSystemFile || !!mediaRegistryDirect;
    if (!resolved.ok) resolved.error = resolved.soundSystem.reason;
  }`;
    if (!src.includes(oldUse)) throw new Error('media_resolve_sound_usecase_block_not_found');
    src = src.replace(oldUse, newUse);

    console.log('[patch] media resolve marks registry assets sound-system compatible via mediaId');
  } else {
    console.log('[skip] media resolve already marks registry direct mediaId');
  }

  write(mediaPath, src);
}

function patchDocs() {
  write(docsBackend, `# STEP275A - Sound-System spielt Media-Registry per mediaId

## Ziel

Neue Medien sollen nicht mehr zwingend nach \`htdocs/assets/sounds/...\` kopiert werden muessen, nur damit das Sound-System sie abspielen kann.

## Umsetzung

\`/api/sound/play\` und \`/api/sound/bundle\`-Items koennen jetzt optional \`mediaId\` / \`media_id\` enthalten.

Das Sound-System:

1. liest \`media_assets\` aus der SQLite-Datenbank,
2. prueft, ob die Datei innerhalb von \`htdocs/assets\` liegt,
3. liest Media-Infos direkt vom absoluten Pfad,
4. setzt Browser-URL auf \`/assets/media/...\`,
5. nutzt fuer Device-Playback den absoluten Pfad.

## Beispiel

\`\`\`powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/sound/play" -Method POST -ContentType "application/json" -Body '{"mediaId":1234,"label":"MediaId Test","category":"test","outputTarget":"overlay","target":"stream","volume":85}'
\`\`\`

## Wichtig

STEP275A aendert noch nicht automatisch das Birthday-Modul.
Das folgt im naechsten Step, damit Birthday neue Songs nur noch als \`mediaId\` speichert und keine Kopie nach \`assets/sounds/birthday\` erzeugt.
`);

  appendOnce(changelogPath, 'STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT', `
## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

- Sound-System kann Media-Registry-Assets direkt per \`mediaId\` / \`media_id\` abspielen.
- \`/api/media/resolve?useCase=sound_system\` markiert \`assets/media/...\`-Assets als kompatibel, wenn direkte mediaId-Wiedergabe möglich ist.
- Keine Entfernung bestehender \`assets/sounds/...\`-Kompatibilität.
`);

  appendOnce(currentPath, 'STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT', `
## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

Sound-System unterstützt jetzt direkte Media-Registry-Wiedergabe per \`mediaId\`. Ziel ist, künftige doppelte Birthday-/Sound-Dateien zu vermeiden. Bestehende Legacy-Pfade funktionieren weiterhin.
`);

  appendOnce(nextPath, 'STEP275B_BIRTHDAY_STORE_MEDIAID_PLANNED', `
## STEP275B_BIRTHDAY_STORE_MEDIAID_PLANNED

Nächster Step: Birthday soll neue Medien bevorzugt als \`mediaId\` speichern und beim Playback direkt ans Sound-System übergeben, statt Kopien nach \`assets/sounds/birthday\` zu erzeugen.
`);

  appendOnce(filesPath, 'STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT', `
## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

- \`backend/modules/sound_system.js\` - direkte Wiedergabe von Media-Registry-Assets per \`mediaId\`.
- \`backend/modules/media.js\` - \`resolve\` meldet Media-Registry-Assets als Sound-System-kompatibel via direkter mediaId-Wiedergabe.
- \`docs/backend/SOUND_SYSTEM_MEDIAID_DIRECT_STEP275A.md\` - Test-/Status-Dokumentation.
`);

  appendOnce(docsCurrentPath, 'STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT', `
## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

Sound-System kann Medien aus der Media-Registry direkt per \`mediaId\` abspielen. Legacy-Sounds unter \`assets/sounds\` bleiben unverändert kompatibel.
`);
  console.log('[patch] docs updated');
}

patchSoundSystem();
patchMediaModule();
patchDocs();
console.log('[done] STEP275A Sound-System mediaId direct applied');
