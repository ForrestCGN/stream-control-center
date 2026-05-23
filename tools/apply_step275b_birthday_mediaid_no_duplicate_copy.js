const fs = require('fs');
const path = require('path');

const root = process.cwd();
const birthdayPath = path.join(root, 'backend', 'modules', 'birthday.js');
const changelogPath = path.join(root, 'project-state', 'CHANGELOG.md');
const currentPath = path.join(root, 'project-state', 'CURRENT_STATUS.md');
const filesPath = path.join(root, 'project-state', 'FILES.md');
const nextPath = path.join(root, 'project-state', 'NEXT_STEPS.md');
const docsCurrentPath = path.join(root, 'docs', 'current', 'CURRENT_SYSTEM_STATUS.md');
const docsBackendPath = path.join(root, 'docs', 'backend', 'BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY_STEP275B.md');

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

function patchBirthday() {
  if (!fs.existsSync(birthdayPath)) throw new Error(`missing_file:${birthdayPath}`);
  backup(birthdayPath, 'step275b');

  let src = read(birthdayPath);

  if (!src.includes('STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY')) {
    const anchor = '\nasync function handleBirthdayAssetUpload(payload = {}, file = null) {';
    if (!src.includes(anchor)) throw new Error('handleBirthdayAssetUpload_anchor_not_found');

    const block = `
// STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY
// Neue MediaPicker-Übernahmen speichern bevorzugt mediaId-Referenzen statt Kopien unter assets/sounds/birthday.
// Legacy-Dateien unter assets/sounds bleiben vollständig kompatibel.
function birthdayMediaIdRef(mediaId) {
  const id = Number(mediaId || 0);
  return id > 0 ? \`mediaid:\${id}\` : '';
}

function parseBirthdayMediaIdRef(value) {
  const raw = clean(value || '');
  const match = raw.match(/^mediaid:(\\d+)$/i);
  return match ? Number(match[1]) : 0;
}

function isBirthdayMediaIdRef(value) {
  return parseBirthdayMediaIdRef(value) > 0;
}

function getBirthdayMediaAsset(mediaId) {
  const id = Number(mediaId || 0);
  if (!id) return null;
  try {
    return database.get('SELECT * FROM media_assets WHERE id = :id AND status = :status LIMIT 1', { id, status: 'active' }) || null;
  } catch (_) {
    return null;
  }
}

function birthdayAssetsBaseDir() {
  if (typeof config.getAssetsDir === 'function') return config.getAssetsDir();
  return config.resolveFromRoot('htdocs', 'assets');
}

function birthdayPathInside(parent, child) {
  const rootPath = path.resolve(parent);
  const targetPath = path.resolve(child);
  const rel = path.relative(rootPath, targetPath);
  return rel === '' || (!!rel && !rel.startsWith('..') && !path.isAbsolute(rel));
}

function birthdayMediaInfoForRegistryId(mediaId, fallbackMs = 0) {
  const asset = getBirthdayMediaAsset(mediaId);
  if (!asset) {
    return {
      ok: false,
      mediaId: Number(mediaId || 0),
      file: birthdayMediaIdRef(mediaId),
      webPath: '',
      durationMs: Math.max(0, Number(fallbackMs || 0)),
      durationOk: false,
      durationSource: fallbackMs ? 'fallback' : 'unknown',
      fallbackUsed: Number(fallbackMs || 0) > 0,
      hasAudio: false,
      hasVideo: false,
      error: 'media_asset_not_found'
    };
  }

  const assetsDir = birthdayAssetsBaseDir();
  const relativePath = safeRelativeMediaFile(asset.relative_path || asset.relativePath || '');
  const absolutePath = path.resolve(asset.absolute_path || asset.absolutePath || path.join(assetsDir, relativePath));
  const insideAssets = birthdayPathInside(assetsDir, absolutePath);
  const exists = insideAssets && fs.existsSync(absolutePath);
  let info = { ok: false, durationMs: 0, durationOk: false, hasAudio: false, hasVideo: false, width: 0, height: 0, error: exists ? '' : 'file_missing' };

  if (exists) {
    try {
      info = mediaHelper.readMediaInfo(absolutePath, {});
    } catch (err) {
      info = { ...info, error: err.message || String(err) };
    }
  }

  const durationMs = Number(info.durationMs || asset.duration_ms || asset.durationMs || fallbackMs || 0);
  return {
    ok: exists && (info.ok !== false),
    mediaId: Number(asset.id || mediaId || 0),
    file: birthdayMediaIdRef(asset.id || mediaId),
    relativePath,
    absolutePath,
    webPath: asset.web_path || asset.webPath || (relativePath ? \`/assets/\${relativePath}\` : ''),
    durationMs,
    durationOk: !!info.durationOk || durationMs > 0,
    durationSource: info.durationOk ? 'ffprobe' : (asset.duration_ms || asset.durationMs ? 'media_registry' : (fallbackMs ? 'fallback' : 'unknown')),
    fallbackUsed: !info.durationOk && Number(fallbackMs || 0) > 0,
    hasAudio: info.hasAudio !== false || Number(asset.has_audio || 0) === 1,
    hasVideo: !!info.hasVideo || Number(asset.has_video || 0) === 1 || ['video','animation'].includes(String(asset.type || '').toLowerCase()),
    width: Number(info.width || asset.width || 0),
    height: Number(info.height || asset.height || 0),
    fileName: asset.file_name || '',
    displayName: asset.display_name || '',
    error: exists ? (info.error || '') : 'file_missing'
  };
}

function birthdaySoundPayloadForRef(relativeOrMediaIdRef, mediaType = 'audio') {
  const ref = safeRelativeMediaFile(relativeOrMediaIdRef || '');
  const mediaId = parseBirthdayMediaIdRef(ref);
  if (mediaId) {
    return {
      mediaId,
      mediaType,
      file: '',
      meta: {
        mediaId,
        mediaRef: birthdayMediaIdRef(mediaId),
        playbackSource: 'media_registry'
      }
    };
  }
  return { file: ref, mediaType };
}

// Override ab STEP275B: unterstützt mediaid:<id> im bestehenden song_file/video_file-Feld.
function mediaInfoForSoundFile(file, fallbackMs = 0) {
  const relative = safeRelativeMediaFile(file);
  const mediaId = parseBirthdayMediaIdRef(relative);
  if (mediaId) return birthdayMediaInfoForRegistryId(mediaId, fallbackMs);
  if (!relative) return { ok: false, file: '', durationMs: Math.max(0, Number(fallbackMs || 0)), durationOk: false, error: 'file_missing' };
  try {
    const info = mediaHelper.getMediaInfo(relative, { baseDir: config.getSoundsDir(), allowedExtensions: mediaHelper.DEFAULT_ALLOWED_EXTENSIONS });
    return {
      ok: !!info.ok,
      file: relative,
      webPath: \`/assets/sounds/\${relative}\`,
      durationMs: Number(info.durationMs || fallbackMs || 0),
      durationOk: !!info.durationOk,
      durationSource: info.durationOk ? 'ffprobe' : (fallbackMs ? 'fallback' : 'unknown'),
      fallbackUsed: !info.durationOk && Number(fallbackMs || 0) > 0,
      hasAudio: info.hasAudio !== false,
      hasVideo: !!info.hasVideo,
      width: Number(info.width || 0),
      height: Number(info.height || 0),
      error: info.error || ''
    };
  } catch (err) {
    return { ok: false, file: relative, webPath: \`/assets/sounds/\${relative}\`, durationMs: Math.max(0, Number(fallbackMs || 0)), durationOk: false, durationSource: fallbackMs ? 'fallback' : 'unknown', fallbackUsed: Number(fallbackMs || 0) > 0, error: err.message || String(err) };
  }
}

// Override ab STEP275B: User-/Default-/Intro-Import kann mediaId speichern.
async function updateBirthdayShowUploadReference(kind, relativePath, mediaInfo, payload = {}) {
  const cleanKind = clean(kind).toLowerCase();
  const durationMs = Number(mediaInfo?.durationMs || 0);
  const mediaId = Number(payload.mediaId || payload.media_id || payload.id || mediaInfo?.mediaId || 0);
  const ref = mediaId ? birthdayMediaIdRef(mediaId) : safeRelativeMediaFile(relativePath);

  if (cleanKind === 'intro_video') {
    settings.setSetting(SETTINGS_TABLE, 'show.defaultVideoFile', ref, { valueType: 'string', description: 'Birthday globales Intro-Video über Sound-System oder Media-Registry.' });
    if (durationMs > 0) settings.setSetting(SETTINGS_TABLE, 'show.defaultVideoDurationMs', durationMs, { valueType: 'number', description: 'Automatisch erkannte Intro-Video-Dauer.' });
    reloadRuntime();
    return { target: 'default_intro_video', setting: 'show.defaultVideoFile', mediaId, referenceMode: mediaId ? 'media_registry' : 'legacy_sound_file' };
  }

  if (cleanKind === 'default_song') {
    settings.setSetting(SETTINGS_TABLE, 'show.defaultSongFile', ref, { valueType: 'string', description: 'Birthday Standardsong über Sound-System oder Media-Registry.' });
    if (durationMs > 0) settings.setSetting(SETTINGS_TABLE, 'show.partyDurationMs', durationMs, { valueType: 'number', description: 'Fallback-/Standardsong-Dauer für Birthday-Show.' });
    reloadRuntime();
    return { target: 'default_song', setting: 'show.defaultSongFile', mediaId, referenceMode: mediaId ? 'media_registry' : 'legacy_sound_file' };
  }

  if (cleanKind === 'user_song') {
    const resolved = await resolveBirthdayTarget(payload.login || payload.userLogin || payload.username || '', { requireMention: false, requirePresent: false });
    const login = cleanLogin(resolved.login || payload.login || payload.userLogin || payload.username || '');
    if (!login) throw new Error('user_login_required_for_user_song');
    const profile = upsertBirthdayShowProfileSong({
      login,
      displayName: resolved.displayName || payload.displayName || payload.userDisplayName || '',
      avatarUrl: resolved.avatarUrl || payload.avatarUrl || '',
      songFile: ref,
      durationMs,
      volume: Number(payload.volume || 0) || 0,
      source: mediaId ? 'media_registry_mediaid' : 'dashboard_upload'
    });
    const existingUser = getBirthdayUser(login);
    if (existingUser) {
      database.run(\`
        UPDATE birthday_users
        SET show_song_file = :file,
            show_song_duration_ms = :durationMs,
            updated_at = :updatedAt
        WHERE user_login = :login
      \`, { login, file: ref, durationMs, updatedAt: nowIso() });
    }
    return { target: 'user_song', login, profile, mediaId, referenceMode: mediaId ? 'media_registry' : 'legacy_sound_file' };
  }

  throw new Error('invalid_upload_kind');
}

// Override ab STEP275B: MediaPicker-Import kopiert NICHT mehr nach assets/sounds/birthday.
async function importBirthdayMediaAsset(payload = {}) {
  const kind = clean(payload.kind || payload.type || '');
  const mediaId = Number(payload.mediaId || payload.media_id || payload.id || 0);
  if (!mediaId) throw new Error('media_id_required');

  const asset = getBirthdayMediaAsset(mediaId);
  if (!asset) throw new Error('media_asset_not_found');

  const sourceAbs = path.resolve(asset.absolute_path || asset.absolutePath || path.join(birthdayAssetsBaseDir(), safeRelativeMediaFile(asset.relative_path || '')));
  if (!sourceAbs || !fs.existsSync(sourceAbs)) throw new Error('media_asset_file_missing');

  const ext = path.extname(asset.file_name || asset.fileName || sourceAbs).toLowerCase();
  if (!assertUploadAllowed(kind, ext)) throw new Error(\`upload_extension_not_allowed:\${ext || 'missing'}\`);

  const mediaInfo = birthdayMediaInfoForRegistryId(mediaId, 0);
  const reference = await updateBirthdayShowUploadReference(kind, birthdayMediaIdRef(mediaId), mediaInfo, { ...payload, mediaId });

  return {
    ok: true,
    module: MODULE_NAME,
    step: 'STEP275B',
    message: 'Birthday-Medium wurde als Media-Registry-Referenz übernommen.',
    copied: false,
    duplicateFileCreated: false,
    kind,
    source: 'media_registry',
    mediaId,
    referenceMode: 'media_registry',
    sourceAsset: {
      id: Number(asset.id),
      displayName: asset.display_name || '',
      fileName: asset.file_name || '',
      relativePath: asset.relative_path || '',
      webPath: asset.web_path || ''
    },
    relativePath: birthdayMediaIdRef(mediaId),
    webPath: mediaInfo.webPath || '',
    mediaInfo,
    reference,
    user: reference.login ? getBirthdayUser(reference.login) : null,
    profile: reference.login ? getBirthdayShowProfile(reference.login) : null,
    assets: buildBirthdayShowAssets(),
    status: buildStatus()
  };
}

async function importBirthdayMediaAssetFromRegistry(payload = {}) {
  return importBirthdayMediaAsset(payload);
}
`;
    src = src.replace(anchor, block + anchor);
    console.log('[patch] birthday mediaId no-copy override inserted');
  } else {
    console.log('[skip] birthday mediaId no-copy override already present');
  }

  // Patch sound bundle creation for mediaid:<id> refs.
  if (!src.includes('STEP275B_BUNDLE_INTRO_MEDIAID_PAYLOAD')) {
    const oldIntro = `    items.push(soundBundleItemBase(asset, targetContext, {
      role: 'intro',
      bundleRole: 'intro',
      file: asset.videoFile,
      mediaType: 'video',
      label: \`Birthday Intro \${targetContext.targetDisplayName || ''}\`.trim(),
      volume: 100,
      durationMs: asset.videoDurationMs || 0,
      meta: { ...(soundBundleItemBase(asset, targetContext).meta || {}), birthdayPhase: 'intro' }
    }));`;
    const newIntro = `    const introPayload = birthdaySoundPayloadForRef(asset.videoFile, 'video'); // STEP275B_BUNDLE_INTRO_MEDIAID_PAYLOAD
    items.push(soundBundleItemBase(asset, targetContext, {
      role: 'intro',
      bundleRole: 'intro',
      ...introPayload,
      label: \`Birthday Intro \${targetContext.targetDisplayName || ''}\`.trim(),
      volume: 100,
      durationMs: asset.videoDurationMs || 0,
      meta: { ...(soundBundleItemBase(asset, targetContext).meta || {}), ...(introPayload.meta || {}), birthdayPhase: 'intro' }
    }));`;
    if (!src.includes(oldIntro)) throw new Error('birthday_bundle_intro_anchor_not_found');
    src = src.replace(oldIntro, newIntro);
    console.log('[patch] birthday bundle intro supports mediaId');
  } else {
    console.log('[skip] birthday bundle intro already supports mediaId');
  }

  if (!src.includes('STEP275B_BUNDLE_SONG_MEDIAID_PAYLOAD')) {
    const oldSong = `    items.push(soundBundleItemBase(asset, targetContext, {
      role: 'song',
      bundleRole: 'song',
      file: asset.songFile,
      mediaType: 'audio',
      label: \`Birthday Song \${targetContext.targetDisplayName || ''}\`.trim(),
      volume: Number(asset.songVolume || cfg.show?.defaultSongVolume || 85),
      durationMs: asset.songDurationMs || asset.partyDurationMs || 0,
      meta: { ...(soundBundleItemBase(asset, targetContext).meta || {}), birthdayPhase: 'party' }
    }));`;
    const newSong = `    const songPayload = birthdaySoundPayloadForRef(asset.songFile, 'audio'); // STEP275B_BUNDLE_SONG_MEDIAID_PAYLOAD
    items.push(soundBundleItemBase(asset, targetContext, {
      role: 'song',
      bundleRole: 'song',
      ...songPayload,
      label: \`Birthday Song \${targetContext.targetDisplayName || ''}\`.trim(),
      volume: Number(asset.songVolume || cfg.show?.defaultSongVolume || 85),
      durationMs: asset.songDurationMs || asset.partyDurationMs || 0,
      meta: { ...(soundBundleItemBase(asset, targetContext).meta || {}), ...(songPayload.meta || {}), birthdayPhase: 'party' }
    }));`;
    if (!src.includes(oldSong)) throw new Error('birthday_bundle_song_anchor_not_found');
    src = src.replace(oldSong, newSong);
    console.log('[patch] birthday bundle song supports mediaId');
  } else {
    console.log('[skip] birthday bundle song already supports mediaId');
  }

  // Patch single-play helpers too, although current show uses bundles. Keeps compatibility.
  if (!src.includes('STEP275B_PLAY_INTRO_MEDIAID_PAYLOAD')) {
    const old = `  return internalRequest('POST', '/api/sound/play', soundPlayBase(asset, targetContext, {
    file: asset.videoFile,
    mediaType: 'video',
    label: \`Birthday Intro \${targetContext.targetDisplayName || ''}\`.trim(),
    volume: 100,
    durationMs: asset.videoDurationMs || 0
  }));`;
    const neu = `  const introPayload = birthdaySoundPayloadForRef(asset.videoFile, 'video'); // STEP275B_PLAY_INTRO_MEDIAID_PAYLOAD
  return internalRequest('POST', '/api/sound/play', soundPlayBase(asset, targetContext, {
    ...introPayload,
    label: \`Birthday Intro \${targetContext.targetDisplayName || ''}\`.trim(),
    volume: 100,
    durationMs: asset.videoDurationMs || 0
  }));`;
    if (src.includes(old)) {
      src = src.replace(old, neu);
      console.log('[patch] single intro playback supports mediaId');
    }
  }

  if (!src.includes('STEP275B_PLAY_SONG_MEDIAID_PAYLOAD')) {
    const old = `  return internalRequest('POST', '/api/sound/play', soundPlayBase(asset, targetContext, {
    file: asset.songFile,
    mediaType: 'audio',
    label: \`Birthday Song \${targetContext.targetDisplayName || targetContext.displayName || ''}\`.trim(),
    volume: Number(asset.songVolume || cfg.show?.defaultSongVolume || 85),
    durationMs: asset.songDurationMs || asset.partyDurationMs || 0
  }));`;
    const neu = `  const songPayload = birthdaySoundPayloadForRef(asset.songFile, 'audio'); // STEP275B_PLAY_SONG_MEDIAID_PAYLOAD
  return internalRequest('POST', '/api/sound/play', soundPlayBase(asset, targetContext, {
    ...songPayload,
    label: \`Birthday Song \${targetContext.targetDisplayName || targetContext.displayName || ''}\`.trim(),
    volume: Number(asset.songVolume || cfg.show?.defaultSongVolume || 85),
    durationMs: asset.songDurationMs || asset.partyDurationMs || 0
  }));`;
    if (src.includes(old)) {
      src = src.replace(old, neu);
      console.log('[patch] single song playback supports mediaId');
    }
  }

  // Patch asset info display to understand mediaid refs.
  if (!src.includes('STEP275B_BUILD_ASSET_INFO_MEDIAID')) {
    const old = `function buildAssetInfo(label, role, relativeFile, fallbackMs = 0, expectedKind = 'audio') {
  const relative = safeRelativeMediaFile(relativeFile || '');
  const fileCheck = fileExistsForSound(relative);
  const mediaInfo = relative ? mediaInfoForSoundFile(relative, fallbackMs) : { ok: false, file: '', webPath: '', durationMs: Number(fallbackMs || 0), durationOk: false, durationSource: fallbackMs ? 'fallback' : 'unknown', fallbackUsed: Number(fallbackMs || 0) > 0, hasAudio: false, hasVideo: false, error: 'file_missing' };
  const ext = path.extname(relative || '').toLowerCase();
  const soundSystemCanPlay = !!relative && fileCheck.exists && ['.mp3', '.wav', '.ogg', '.m4a', '.webm', '.mp4', '.mov'].includes(ext);
  const kindOk = expectedKind === 'video' ? !!mediaInfo.hasVideo : !!mediaInfo.hasAudio;`;
    const neu = `function buildAssetInfo(label, role, relativeFile, fallbackMs = 0, expectedKind = 'audio') {
  const relative = safeRelativeMediaFile(relativeFile || '');
  const mediaId = parseBirthdayMediaIdRef(relative); // STEP275B_BUILD_ASSET_INFO_MEDIAID
  const mediaInfo = mediaId ? birthdayMediaInfoForRegistryId(mediaId, fallbackMs) : (relative ? mediaInfoForSoundFile(relative, fallbackMs) : { ok: false, file: '', webPath: '', durationMs: Number(fallbackMs || 0), durationOk: false, durationSource: fallbackMs ? 'fallback' : 'unknown', fallbackUsed: Number(fallbackMs || 0) > 0, hasAudio: false, hasVideo: false, error: 'file_missing' });
  const fileCheck = mediaId ? { exists: !!mediaInfo.ok, absolutePath: mediaInfo.absolutePath || '', relativePath: relative, sizeBytes: 0 } : fileExistsForSound(relative);
  const ext = mediaId ? path.extname(mediaInfo.fileName || mediaInfo.relativePath || '').toLowerCase() : path.extname(relative || '').toLowerCase();
  const soundSystemCanPlay = mediaId ? !!mediaInfo.ok : (!!relative && fileCheck.exists && ['.mp3', '.wav', '.ogg', '.m4a', '.webm', '.mp4', '.mov'].includes(ext));
  const kindOk = expectedKind === 'video' ? !!mediaInfo.hasVideo : !!mediaInfo.hasAudio;`;
    if (!src.includes(old)) throw new Error('buildAssetInfo_anchor_not_found');
    src = src.replace(old, neu);

    const oldWeb = `    webPath: relative ? \`/assets/sounds/\${relative}\` : '',`;
    const newWeb = `    webPath: mediaInfo.webPath || (relative && !mediaId ? \`/assets/sounds/\${relative}\` : ''),`;
    src = src.replace(oldWeb, newWeb);

    const oldSoundSystem = `      relativeFile: relative,`;
    const newSoundSystem = `      relativeFile: relative,
      mediaId,
      referenceMode: mediaId ? 'media_registry' : 'legacy_sound_file',`;
    src = src.replace(oldSoundSystem, newSoundSystem);

    console.log('[patch] Birthday asset status supports mediaId refs');
  } else {
    console.log('[skip] Birthday asset status already supports mediaId refs');
  }

  write(birthdayPath, src);
}

function patchDocs() {
  write(docsBackendPath, `# STEP275B - Birthday speichert MediaPicker-Import ohne doppelte Sound-Kopie

## Ziel

Neue Birthday-Medien, die über den MediaPicker ausgewählt werden, sollen nicht mehr zusätzlich nach \`htdocs/assets/sounds/birthday\` kopiert werden.

## Umsetzung

Birthday speichert bei MediaPicker-Import jetzt eine Referenz im bestehenden Feld:

\`\`\`text
mediaid:<ID>
\`\`\`

Beispiel:

\`\`\`text
mediaid:1313
\`\`\`

Beim Start der Geburtstagsshow wird daraus ein Sound-System-Payload mit \`mediaId\` gebaut.
Das Sound-System aus STEP275A spielt dann direkt aus \`htdocs/assets/media/...\`.

## Bestehende Dateien

Legacy-Pfade wie

\`\`\`text
birthday/birthday_song_urlug.mp3
\`\`\`

bleiben kompatibel und werden weiterhin abgespielt.

## Wichtig

- Neue MediaPicker-Übernahmen erzeugen keine neue Kopie unter \`assets/sounds/birthday\`.
- Direktupload über den alten Legacy-Fallback bleibt weiterhin möglich und schreibt wie bisher nach \`assets/sounds/birthday\`.
- Keine bestehende Funktionalität wurde entfernt.
`);

  appendOnce(changelogPath, 'STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY', `
## STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY

- Birthday MediaPicker-Import speichert neue Medien als \`mediaid:<id>\` statt Kopien unter \`assets/sounds/birthday\` zu erzeugen.
- Birthday-Sound-Bundles übergeben bei \`mediaid:<id>\` direkt \`mediaId\` an das Sound-System.
- Legacy-Dateien unter \`assets/sounds/birthday\` bleiben kompatibel.
`);

  appendOnce(currentPath, 'STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY', `
## STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY

Birthday nutzt nach MediaPicker-Import bevorzugt Media-Registry-Referenzen. Neue User-Songs/Standardsongs/Intro-Medien müssen dadurch nicht mehr doppelt nach \`assets/sounds/birthday\` kopiert werden.
`);

  appendOnce(nextPath, 'STEP275C_DUPLICATE_CLEANUP_PLANNED', `
## STEP275C_DUPLICATE_CLEANUP_PLANNED

Optionaler nächster Step: Diagnose/Aufräumplan für alte doppelte Birthday-Dateien unter \`assets/sounds/birthday\`, ohne automatisch zu löschen.
`);

  appendOnce(filesPath, 'STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY', `
## STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY

- \`backend/modules/birthday.js\` - MediaPicker-Import speichert \`mediaid:<id>\`; Birthday-Bundles übergeben \`mediaId\` ans Sound-System.
- \`docs/backend/BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY_STEP275B.md\` - technische Kurzdokumentation.
`);

  appendOnce(docsCurrentPath, 'STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY', `
## STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY

Birthday MediaPicker-Import erzeugt keine zusätzliche Sound-Kopie mehr, sondern speichert Media-Registry-Referenzen. Legacy-Sounds bleiben weiterhin kompatibel.
`);
}

patchBirthday();
patchDocs();
console.log('[done] STEP275B Birthday mediaId no duplicate copy applied');
