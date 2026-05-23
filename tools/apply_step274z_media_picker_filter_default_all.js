const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pickerPath = path.join(root, 'htdocs', 'dashboard', 'components', 'media_picker.js');
const filesPath = path.join(root, 'project-state', 'FILES.md');
const currentPath = path.join(root, 'project-state', 'CURRENT_STATUS.md');
const changelogPath = path.join(root, 'project-state', 'CHANGELOG.md');
const nextPath = path.join(root, 'project-state', 'NEXT_STEPS.md');
const docsCurrentPath = path.join(root, 'docs', 'current', 'CURRENT_SYSTEM_STATUS.md');

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function backup(file) {
  if (!fs.existsSync(file)) return;
  const bak = `${file}.step274z.bak`;
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
}

function patchMediaPicker() {
  if (!fs.existsSync(pickerPath)) throw new Error(`missing_file:${pickerPath}`);
  backup(pickerPath);
  let src = read(pickerPath);

  if (!src.includes('function open(config = {})')) {
    throw new Error('media_picker_open_function_not_found');
  }

  // Ensure the visible browse/filter dropdown starts at "Alle Zusatzkategorien".
  // Important: uploadCategoryKey still uses config.categoryKey so the upload target stays module-specific.
  const patterns = [
    {
      from: "    state.categoryKey = config.categoryKey || '';",
      to: "    // STEP274Z: Beim Öffnen immer alle Zusatzkategorien anzeigen; Upload-Ziel bleibt config.categoryKey.\n    state.categoryKey = config.initialFilterCategoryKey || '';"
    },
    {
      from: "    state.categoryKey = config.filterCategoryKey || '';",
      to: "    // STEP274Z: Beim Öffnen immer alle Zusatzkategorien anzeigen; Upload-Ziel bleibt config.categoryKey.\n    state.categoryKey = config.initialFilterCategoryKey || '';"
    },
    {
      from: "    state.categoryKey = '';",
      to: "    // STEP274Z: Beim Öffnen immer alle Zusatzkategorien anzeigen; Upload-Ziel bleibt config.categoryKey.\n    state.categoryKey = config.initialFilterCategoryKey || '';"
    }
  ];

  let changed = false;
  for (const pattern of patterns) {
    if (src.includes(pattern.from)) {
      src = src.replace(pattern.from, pattern.to);
      changed = true;
      break;
    }
  }

  if (!changed && !src.includes('STEP274Z: Beim Öffnen immer alle Zusatzkategorien anzeigen')) {
    throw new Error('media_picker_category_reset_anchor_not_found');
  }

  // Add a small explanatory hint in the filter label, without changing behavior.
  if (!src.includes('STEP274Z_FILTER_HINT')) {
    src = src.replace(
      '<label>Zusatzkategorie<select data-mp-category>${categoryOptions(state.categoryKey)}</select></label>',
      '<label>Zusatzkategorie <small class="mp-filter-hint">Filter, nicht Upload-Ziel</small><select data-mp-category>${categoryOptions(state.categoryKey)}</select></label>'
    );
  }

  write(pickerPath, src);
  console.log('[patch] media_picker visible category filter defaults to all');
}

function appendOnce(file, marker, content) {
  let src = read(file);
  if (src.includes(marker)) return;
  write(file, `${src.trimEnd()}\n\n${content.trim()}\n`);
}

function patchDocs() {
  write(path.join(root, 'docs', 'dashboard', 'MEDIA_PICKER_FILTER_DEFAULT_ALL.md'), `# STEP274Z - MediaPicker Filter startet auf Alle Zusatzkategorien

## Ziel

Beim Öffnen des zentralen MediaPickers soll der sichtbare Filter \`Zusatzkategorie\` zuerst auf \`Alle Zusatzkategorien\` stehen.

Das Upload-Ziel bleibt davon getrennt:

- Birthday Intro: \`birthday / intro\`
- Birthday Standardsong: \`birthday / default-song\`
- Birthday User-Song: \`birthday / user-songs\`
- Birthday Party-Song: \`birthday / party-songs\`

## Warum

Der sichtbare Kategorie-Filter steuert nur die Medienliste im Picker.
Das Upload-Ziel wird separat über \`config.categoryKey\` gesetzt und bleibt weiterhin korrekt.

## Betroffene Datei

- \`htdocs/dashboard/components/media_picker.js\`
`);

  appendOnce(currentPath, 'STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL', `
## STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL

Der zentrale MediaPicker startet beim Öffnen wieder mit dem sichtbaren Filter \`Alle Zusatzkategorien\`.
Das Upload-Ziel bleibt weiterhin über \`config.categoryKey\` modul-/button-spezifisch gesetzt.
`);

  appendOnce(changelogPath, 'STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL', `
## STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL

- MediaPicker-Filter \`Zusatzkategorie\` startet beim Öffnen auf \`Alle Zusatzkategorien\`.
- Upload-Zielkategorie bleibt unverändert getrennt über \`config.categoryKey\`.
- Hinweis im Picker ergänzt: Kategorieauswahl oben ist Filter, nicht Upload-Ziel.
`);

  appendOnce(nextPath, 'STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL_DONE', `
## STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL_DONE

Abgeschlossen: MediaPicker trennt sichtbaren Kategorie-Filter und Upload-Ziel deutlicher.
`);

  appendOnce(filesPath, 'STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL', `
## STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL

- \`htdocs/dashboard/components/media_picker.js\` - sichtbarer Zusatzkategorie-Filter startet auf Alle; Upload-Ziel bleibt separat.
- \`docs/dashboard/MEDIA_PICKER_FILTER_DEFAULT_ALL.md\` - Kurzdokumentation.
`);

  appendOnce(docsCurrentPath, 'STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL', `
## STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL

MediaPicker: sichtbarer Zusatzkategorie-Filter startet beim Öffnen auf \`Alle Zusatzkategorien\`; Upload-Ziel bleibt weiterhin über die aufrufende Modulkonfiguration gesetzt.
`);
  console.log('[patch] docs updated');
}

patchMediaPicker();
patchDocs();
console.log('[done] STEP274Z MediaPicker filter default all applied');
