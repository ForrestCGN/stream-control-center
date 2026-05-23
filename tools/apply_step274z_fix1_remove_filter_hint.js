const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pickerPath = path.join(root, 'htdocs', 'dashboard', 'components', 'media_picker.js');
const changelogPath = path.join(root, 'project-state', 'CHANGELOG.md');
const currentPath = path.join(root, 'project-state', 'CURRENT_STATUS.md');
const filesPath = path.join(root, 'project-state', 'FILES.md');

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function backup(file) {
  if (!fs.existsSync(file)) return;
  const bak = `${file}.step274z_fix1.bak`;
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
}

function appendOnce(file, marker, content) {
  const src = read(file);
  if (src.includes(marker)) return;
  write(file, `${src.trimEnd()}\n\n${content.trim()}\n`);
}

function patchPicker() {
  if (!fs.existsSync(pickerPath)) throw new Error(`missing_file:${pickerPath}`);
  backup(pickerPath);

  let src = read(pickerPath);

  const variants = [
    '<label>Zusatzkategorie <small class="mp-filter-hint">Filter, nicht Upload-Ziel</small><select data-mp-category>${categoryOptions(state.categoryKey)}</select></label>',
    '<label>Zusatzkategorie<small class="mp-filter-hint">Filter, nicht Upload-Ziel</small><select data-mp-category>${categoryOptions(state.categoryKey)}</select></label>'
  ];

  let changed = false;
  for (const variant of variants) {
    if (src.includes(variant)) {
      src = src.replace(variant, '<label>Zusatzkategorie<select data-mp-category>${categoryOptions(state.categoryKey)}</select></label>');
      changed = true;
    }
  }

  // Extra safe fallback: remove only the small hint if formatting differs.
  if (!changed && src.includes('mp-filter-hint')) {
    src = src.replace(/\s*<small class="mp-filter-hint">Filter, nicht Upload-Ziel<\/small>/g, '');
    changed = true;
  }

  if (!changed) {
    console.log('[skip] filter hint not found; media_picker.js already clean');
  } else {
    write(pickerPath, src);
    console.log('[patch] removed MediaPicker filter hint text');
  }
}

function patchDocs() {
  appendOnce(changelogPath, 'STEP274Z_FIX1_REMOVE_FILTER_HINT', `
## STEP274Z_FIX1_REMOVE_FILTER_HINT

- MediaPicker-Hinweis \`Filter, nicht Upload-Ziel\` aus dem sichtbaren Zusatzkategorie-Label entfernt.
- Verhalten bleibt unverändert: sichtbarer Filter startet auf \`Alle Zusatzkategorien\`, Upload-Ziel bleibt separat pro Button gesetzt.
`);

  appendOnce(currentPath, 'STEP274Z_FIX1_REMOVE_FILTER_HINT', `
## STEP274Z_FIX1_REMOVE_FILTER_HINT

MediaPicker: Der sichtbare Zusatztext unter/bei \`Zusatzkategorie\` wurde entfernt. Funktional bleibt die Trennung von Filter und Upload-Ziel bestehen.
`);

  appendOnce(filesPath, 'STEP274Z_FIX1_REMOVE_FILTER_HINT', `
## STEP274Z_FIX1_REMOVE_FILTER_HINT

- \`htdocs/dashboard/components/media_picker.js\` - sichtbarer Hinweis \`Filter, nicht Upload-Ziel\` entfernt.
`);
}

patchPicker();
patchDocs();
console.log('[done] STEP274Z FIX1 applied');
