'use strict';

/**
 * STEP274V FIX1 - Birthday Upload Fallback Guard
 *
 * Fixes the confusing legacy-upload behavior in the Birthday dashboard:
 * - Legacy upload buttons are disabled until a file is selected.
 * - Clicking an empty legacy upload no longer raises a big error banner.
 * - The Show/Medien card gets a central MediaField for registry upload/selection.
 *
 * Safety:
 * - creates .bak-step274v-fix1 backups once
 * - idempotent
 * - does not remove legacy upload actions
 * - does not change backend/database schema
 */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const birthdayJsPath = path.join(rootDir, 'htdocs', 'dashboard', 'modules', 'birthday.js');
const birthdayCssPath = path.join(rootDir, 'htdocs', 'dashboard', 'modules', 'birthday.css');

function fail(msg) {
  console.error(JSON.stringify({ ok: false, step: 'STEP274V_FIX1', error: msg }, null, 2));
  process.exit(1);
}

function backupOnce(file) {
  if (!fs.existsSync(file)) fail(`missing_file: ${file}`);
  const backup = `${file}.bak-step274v-fix1`;
  if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
  return backup;
}

function insertBefore(source, marker, block, label) {
  if (source.includes(block.trim())) return source;
  if (!source.includes(marker)) fail(`marker_not_found: ${label}`);
  return source.replace(marker, `${block}\n${marker}`);
}

function replaceOnce(source, needle, replacement, label) {
  if (source.includes(replacement.trim())) return source;
  if (!source.includes(needle)) fail(`marker_not_found: ${label}`);
  return source.replace(needle, replacement);
}

function patchBirthdayJs() {
  backupOnce(birthdayJsPath);
  let js = fs.readFileSync(birthdayJsPath, 'utf8');

  const guardHelper = `
  function bindBirthdayLegacyUploadGuards() {
    const buttons = Array.from(root?.querySelectorAll('[data-birthday-upload]') || []);
    buttons.forEach(btn => {
      const kind = btn.dataset.birthdayUpload || '';
      const fileInput = kind ? root?.querySelector(`[data-birthday-upload-file="${CSS.escape(kind)}"]`) : null;
      const sync = () => {
        const hasFile = !!fileInput?.files?.length;
        btn.disabled = !hasFile;
        btn.classList.toggle('birthday-disabled-upload', !hasFile);
        btn.title = hasFile ? '' : 'Bitte zuerst eine Datei auswählen.';
      };
      if (fileInput && !fileInput.__birthdayUploadGuardBound) {
        fileInput.addEventListener('change', sync);
        fileInput.__birthdayUploadGuardBound = true;
      }
      sync();
    });
  }
`;

  // Put the helper near the existing MediaField helper when STEP274V is present; otherwise before currentParties.
  if (js.includes('function bindBirthdayMediaFields()')) {
    js = insertBefore(js, `\n\n  function currentParties() {`, guardHelper, 'insert legacy upload guard before currentParties');
  } else {
    js = insertBefore(js, `\n\n  function currentParties() {`, guardHelper, 'insert legacy upload guard before currentParties');
  }

  const noFileNeedle = `    if (!file) throw new Error('Bitte zuerst eine Datei auswählen.');`;
  const noFileReplacement = `    if (!file) {\n      state.notice = 'Bitte zuerst eine Datei auswählen. Die Upload-Buttons sind erst aktiv, wenn eine Datei gewählt wurde.';\n      state.error = '';\n      render();\n      return;\n    }`;
  js = replaceOnce(js, noFileNeedle, noFileReplacement, 'legacy upload no-file guard');

  const showUploadNeedle = `          <div class="birthday-form">\n            <label>Globales Intro-Video<input type="file" data-birthday-upload-file="intro_video" accept="video/webm,video/mp4,video/quicktime"></label>`;
  const showUploadReplacement = `          <div class="birthday-form">\n            <div class="birthday-mediafield-block birthday-show-mediafield" data-media-field data-module-key="birthday" data-category-key="general" data-allowed-types="audio,video,image,animation" data-title="Birthday-Medium auswählen oder hochladen"></div>\n            <p class="birthday-note">Oben nutzt du die zentrale Media-Registry. Die folgenden Datei-Uploads bleiben als Legacy-Fallback für feste Birthday-Dateien erhalten.</p>\n            <label>Globales Intro-Video<input type="file" data-birthday-upload-file="intro_video" accept="video/webm,video/mp4,video/quicktime"></label>`;
  js = replaceOnce(js, showUploadNeedle, showUploadReplacement, 'show mediafield insertion');

  const renderNeedle = `    bind();\n    bindBirthdayMediaFields();\n  }\n\n  function bind() {`;
  const renderReplacement = `    bind();\n    bindBirthdayMediaFields();\n    bindBirthdayLegacyUploadGuards();\n  }\n\n  function bind() {`;
  if (js.includes(renderNeedle)) {
    js = replaceOnce(js, renderNeedle, renderReplacement, 'call legacy upload guard after mediafields');
  } else {
    const fallbackNeedle = `    bind();\n  }\n\n  function bind() {`;
    const fallbackReplacement = `    bind();\n    if (typeof bindBirthdayMediaFields === 'function') bindBirthdayMediaFields();\n    bindBirthdayLegacyUploadGuards();\n  }\n\n  function bind() {`;
    js = replaceOnce(js, fallbackNeedle, fallbackReplacement, 'call legacy upload guard fallback');
  }

  fs.writeFileSync(birthdayJsPath, js, 'utf8');
}

function patchBirthdayCss() {
  backupOnce(birthdayCssPath);
  let css = fs.readFileSync(birthdayCssPath, 'utf8');
  if (css.includes('STEP274V_FIX1 legacy upload guard')) return;
  css += `

/* STEP274V_FIX1 legacy upload guard */
.birthday-disabled-upload{opacity:.45;cursor:not-allowed;filter:saturate(.65)}
.birthday-show-mediafield{margin-bottom:4px}
.birthday-show-mediafield .media-field-preview{min-height:72px}
`;
  fs.writeFileSync(birthdayCssPath, css, 'utf8');
}

try {
  patchBirthdayJs();
  patchBirthdayCss();
  console.log(JSON.stringify({
    ok: true,
    step: 'STEP274V_FIX1',
    patched: [
      'htdocs/dashboard/modules/birthday.js',
      'htdocs/dashboard/modules/birthday.css'
    ],
    backups: [
      'htdocs/dashboard/modules/birthday.js.bak-step274v-fix1',
      'htdocs/dashboard/modules/birthday.css.bak-step274v-fix1'
    ],
    notes: [
      'Legacy birthday upload buttons are disabled until a file is selected.',
      'Empty legacy upload clicks no longer show a red error banner.',
      'Show/Medien now exposes a central MediaField for birthday media registry uploads.'
    ]
  }, null, 2));
} catch (err) {
  fail(err && err.stack ? err.stack : String(err));
}
