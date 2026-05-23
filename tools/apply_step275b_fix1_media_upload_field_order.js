const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pickerPath = path.join(root, 'htdocs', 'dashboard', 'components', 'media_picker.js');
const changelogPath = path.join(root, 'project-state', 'CHANGELOG.md');
const currentPath = path.join(root, 'project-state', 'CURRENT_STATUS.md');
const filesPath = path.join(root, 'project-state', 'FILES.md');
const docsCurrentPath = path.join(root, 'docs', 'current', 'CURRENT_SYSTEM_STATUS.md');
const docsPath = path.join(root, 'docs', 'dashboard', 'MEDIA_PICKER_UPLOAD_FIELD_ORDER_STEP275B_FIX1.md');

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

function patchPicker() {
  if (!fs.existsSync(pickerPath)) throw new Error(`missing_file:${pickerPath}`);
  backup(pickerPath, 'step275b_fix1');

  let src = read(pickerPath);

  if (!src.includes('STEP275B_FIX1_UPLOAD_FIELDS_BEFORE_FILE')) {
    const oldBlock = `    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', state.uploadType || allowedTypes()[0] || 'audio');
    fd.append('moduleKey', moduleKey());
    fd.append('categoryKey', state.uploadCategoryKey || 'general');
    if (state.uploadDisplayName) fd.append('displayName', state.uploadDisplayName);`;
    const newBlock = `    const uploadType = state.uploadType || allowedTypes()[0] || 'audio';
    const uploadModuleKey = moduleKey();
    const uploadCategoryKey = state.uploadCategoryKey || state.config.categoryKey || 'general';
    const fd = new FormData();
    // STEP275B_FIX1_UPLOAD_FIELDS_BEFORE_FILE
    // Multer liest destination/filename bevor die Datei gespeichert wird.
    // Darum muessen type/moduleKey/categoryKey VOR file im multipart-body stehen.
    fd.append('type', uploadType);
    fd.append('moduleKey', uploadModuleKey);
    fd.append('categoryKey', uploadCategoryKey);
    if (state.uploadDisplayName) fd.append('displayName', state.uploadDisplayName);
    fd.append('file', file);`;
    if (!src.includes(oldBlock)) throw new Error('media_picker_upload_formdata_anchor_not_found');
    src = src.replace(oldBlock, newBlock);
    console.log('[patch] MediaPicker upload fields now appended before file');
  } else {
    console.log('[skip] MediaPicker upload field order already patched');
  }

  if (!src.includes('STEP275B_FIX1_UPLOAD_QUERY_FALLBACK')) {
    const oldFetch = `      const res = await fetch(api.upload, { method: 'POST', body: fd });`;
    const newFetch = `      const uploadParams = new URLSearchParams(); // STEP275B_FIX1_UPLOAD_QUERY_FALLBACK
      uploadParams.set('type', uploadType);
      uploadParams.set('moduleKey', uploadModuleKey);
      uploadParams.set('categoryKey', uploadCategoryKey);
      const res = await fetch(\`\${api.upload}?\${uploadParams.toString()}\`, { method: 'POST', body: fd });`;
    if (!src.includes(oldFetch)) throw new Error('media_picker_upload_fetch_anchor_not_found');
    src = src.replace(oldFetch, newFetch);
    console.log('[patch] MediaPicker upload query fallback added');
  } else {
    console.log('[skip] MediaPicker upload query fallback already present');
  }

  write(pickerPath, src);
}

function patchDocs() {
  write(docsPath, `# STEP275B FIX1 - MediaPicker Upload-Zielordner absichern

## Problem

Bei Multipart-Uploads kann Multer \`destination()\` / \`filename()\` ausführen, bevor spätere FormData-Felder verfügbar sind.

Wenn im Frontend zuerst \`file\` gesendet wird und danach \`moduleKey\` / \`categoryKey\`, kann die Datei physisch im Fallback landen:

\`\`\`text
assets/media/general/general/...
\`\`\`

Die DB kann danach trotzdem korrekt zeigen:

\`\`\`text
moduleKey=birthday
categoryKey=user-songs
\`\`\`

## Fix

Der MediaPicker sendet ab jetzt:

1. \`type\`
2. \`moduleKey\`
3. \`categoryKey\`
4. optional \`displayName\`
5. erst danach \`file\`

Zusätzlich werden \`type\`, \`moduleKey\` und \`categoryKey\` als Query-Fallback an \`/api/media/upload\` gehängt.

## Erwartung

Neue Birthday-User-Song-Uploads landen physisch unter:

\`\`\`text
htdocs/assets/media/birthday/user-songs/
\`\`\`
`);

  appendOnce(changelogPath, 'STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER', `
## STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER

- MediaPicker sendet Upload-Metadaten (\`type\`, \`moduleKey\`, \`categoryKey\`) vor der Datei.
- Zusätzlich Query-Fallback für \`/api/media/upload\` ergänzt.
- Behebt Fälle, in denen Dateien physisch unter \`assets/media/general/general\` landeten, obwohl die Registry \`birthday/user-songs\` zeigte.
`);

  appendOnce(currentPath, 'STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER', `
## STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER

MediaPicker-Uploads setzen den Zielordner jetzt zuverlässig vor dem Datei-Stream. Neue Birthday-User-Songs sollen physisch unter \`assets/media/birthday/user-songs\` landen.
`);

  appendOnce(filesPath, 'STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER', `
## STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER

- \`htdocs/dashboard/components/media_picker.js\` - Upload-Metadaten werden vor \`file\` in FormData gesetzt; Query-Fallback ergänzt.
- \`docs/dashboard/MEDIA_PICKER_UPLOAD_FIELD_ORDER_STEP275B_FIX1.md\` - technische Kurznotiz.
`);

  appendOnce(docsCurrentPath, 'STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER', `
## STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER

MediaPicker-Upload-Reihenfolge repariert: \`moduleKey\`/\`categoryKey\` werden vor der Datei übertragen, damit Multer den physischen Zielordner korrekt wählt.
`);
}

patchPicker();
patchDocs();
console.log('[done] STEP275B FIX1 MediaPicker upload field order applied');
