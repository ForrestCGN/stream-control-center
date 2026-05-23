'use strict';

/**
 * STEP274V FIX2 - Birthday Upload Guard Patch
 *
 * Repariert den defekten FIX1-Patcher und wendet den Fallback-Guard
 * direkt auf htdocs/dashboard/modules/birthday.js an.
 *
 * Keine DB-Aenderung.
 * Keine Funktionalitaet entfernen.
 * Alte Birthday-Upload-Buttons bleiben als Fallback erhalten,
 * sind aber deaktiviert, bis eine Datei gewaehlt wurde.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const birthdayJsPath = path.join(repoRoot, 'htdocs', 'dashboard', 'modules', 'birthday.js');
const birthdayCssPath = path.join(repoRoot, 'htdocs', 'dashboard', 'modules', 'birthday.css');
const brokenFix1Path = path.join(repoRoot, 'tools', 'apply_step274v_fix1_birthday_upload_fallback_guard.js');

function read(file) {
  if (!fs.existsSync(file)) throw new Error('file_missing: ' + file);
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function replaceOnce(source, needle, replacement, label) {
  if (!source.includes(needle)) {
    console.log('[skip] ' + label + ' already patched or marker missing.');
    return source;
  }
  console.log('[patch] ' + label);
  return source.replace(needle, replacement);
}

function insertBefore(source, marker, insert, label) {
  if (source.includes(insert.trim().split('\n')[0])) {
    console.log('[skip] ' + label + ' already present.');
    return source;
  }
  if (!source.includes(marker)) throw new Error('marker_missing: ' + label);
  console.log('[patch] ' + label);
  return source.replace(marker, insert + '\n' + marker);
}

function patchBrokenFix1Tool() {
  if (!fs.existsSync(brokenFix1Path)) return;
  const content = `'use strict';

console.log('STEP274V FIX1 wurde durch STEP274V FIX2 ersetzt.');
console.log('Bitte nutzen: node tools/apply_step274v_fix2_birthday_upload_guard_patch.js');
`;
  write(brokenFix1Path, content);
  console.log('[patch] broken FIX1 tool replaced with valid JS stub');
}

function patchBirthdayJs() {
  let src = read(birthdayJsPath);

  const helper = `
  function birthdayUploadSafeKind(kind) {
    return String(kind || '').replace(/[^a-zA-Z0-9_-]/g, '');
  }

  function birthdayUploadFileInput(kind) {
    const safeKind = birthdayUploadSafeKind(kind);
    if (!safeKind) return null;
    return root?.querySelector('[data-birthday-upload-file="' + safeKind + '"]') || null;
  }

  function updateBirthdayUploadFallbackButtons() {
    root?.querySelectorAll('[data-birthday-upload]').forEach(btn => {
      const kind = btn.dataset.birthdayUpload || '';
      const input = birthdayUploadFileInput(kind);
      const hasFile = !!(input && input.files && input.files.length);
      btn.disabled = !hasFile;
      btn.classList.toggle('is-disabled', !hasFile);
      btn.title = hasFile ? '' : 'Bitte zuerst eine Datei auswählen.';
    });
  }

`;

  src = insertBefore(src, '  function currentParties() {', helper, 'birthday upload fallback helpers');

  const oldUploadBind = "    root?.querySelectorAll('[data-birthday-upload]').forEach(btn => btn.addEventListener('click', () => uploadAsset(btn.dataset.birthdayUpload).catch(err => { state.error = err.message; render(); })));";
  const newUploadBind = `    root?.querySelectorAll('[data-birthday-upload-file]').forEach(input => input.addEventListener('change', updateBirthdayUploadFallbackButtons));
    root?.querySelectorAll('[data-birthday-upload]').forEach(btn => btn.addEventListener('click', () => {
      if (btn.disabled) return;
      uploadAsset(btn.dataset.birthdayUpload).catch(err => { state.error = err.message; render(); });
    }));
    updateBirthdayUploadFallbackButtons();`;

  src = replaceOnce(src, oldUploadBind, newUploadBind, 'birthday upload bind guard');

  src = replaceOnce(
    src,
    '<button type="button" data-birthday-upload="intro_video">Intro-Video hochladen</button>',
    '<button type="button" data-birthday-upload="intro_video" disabled title="Bitte zuerst eine Datei auswählen.">Intro-Video hochladen</button>',
    'intro upload button disabled default'
  );

  src = replaceOnce(
    src,
    '<button type="button" data-birthday-upload="default_song">Standardsong hochladen</button>',
    '<button type="button" data-birthday-upload="default_song" disabled title="Bitte zuerst eine Datei auswählen.">Standardsong hochladen</button>',
    'default song upload button disabled default'
  );

  src = replaceOnce(
    src,
    '<button type="button" data-birthday-upload="user_song">User-Song hochladen</button>',
    '<button type="button" data-birthday-upload="user_song" disabled title="Bitte zuerst eine Datei auswählen.">User-Song hochladen</button>',
    'user song upload button disabled default'
  );

  write(birthdayJsPath, src);
}

function patchBirthdayCss() {
  let css = read(birthdayCssPath);
  const add = `

/* STEP274V FIX2 - Birthday Upload Fallback Guard */
.birthday-form button.is-disabled,
.birthday-form button:disabled[data-birthday-upload]{
  opacity:.48;
  cursor:not-allowed;
  filter:saturate(.55);
}
`;
  if (!css.includes('STEP274V FIX2 - Birthday Upload Fallback Guard')) {
    css += add;
    write(birthdayCssPath, css);
    console.log('[patch] birthday upload guard css');
  } else {
    console.log('[skip] birthday upload guard css already present');
  }
}

function main() {
  patchBrokenFix1Tool();
  patchBirthdayJs();
  patchBirthdayCss();

  console.log(JSON.stringify({
    ok: true,
    step: 'STEP274V_FIX2',
    patched: [
      path.relative(repoRoot, brokenFix1Path),
      path.relative(repoRoot, birthdayJsPath),
      path.relative(repoRoot, birthdayCssPath)
    ],
    note: 'Bitte danach stepdone ausfuehren und im Browser Strg+F5 nutzen.'
  }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(JSON.stringify({ ok: false, step: 'STEP274V_FIX2', error: err.message || String(err) }, null, 2));
  process.exit(1);
}
