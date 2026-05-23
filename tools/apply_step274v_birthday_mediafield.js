'use strict';

/**
 * STEP274V - Birthday Dashboard: MediaField Integration
 *
 * Patches the existing birthday dashboard module in-place.
 * Safety:
 * - creates .bak-step274v backups once
 * - idempotent: can be run more than once
 * - does not remove legacy birthday upload buttons
 * - does not change backend/database schema
 */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const birthdayJsPath = path.join(rootDir, 'htdocs', 'dashboard', 'modules', 'birthday.js');
const birthdayCssPath = path.join(rootDir, 'htdocs', 'dashboard', 'modules', 'birthday.css');

function fail(msg) {
  console.error(JSON.stringify({ ok: false, step: 'STEP274V', error: msg }, null, 2));
  process.exit(1);
}

function backupOnce(file) {
  if (!fs.existsSync(file)) fail(`missing_file: ${file}`);
  const backup = `${file}.bak-step274v`;
  if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
  return backup;
}

function replaceOnce(source, needle, replacement, label) {
  if (source.includes(replacement.trim())) return source;
  if (!source.includes(needle)) fail(`marker_not_found: ${label}`);
  return source.replace(needle, replacement);
}

function patchBirthdayJs() {
  backupOnce(birthdayJsPath);
  let js = fs.readFileSync(birthdayJsPath, 'utf8');

  const helperBlock = `

  function bindBirthdayMediaFields() {
    const fields = Array.from(root?.querySelectorAll('[data-birthday-media-target][data-media-field]') || []);
    if (!fields.length) return;
    if (!window.MediaField?.attach) {
      console.warn('[Birthday] MediaField component not available yet.');
      return;
    }
    fields.forEach(field => {
      const targetSelector = field.dataset.birthdayMediaTarget || '';
      if (!field.__birthdayMediaTargetBound) {
        field.addEventListener('media-field:change', ev => {
          const asset = ev.detail?.asset || null;
          const target = targetSelector ? root?.querySelector(targetSelector) : null;
          if (!target) return;
          target.value = asset ? (asset.relativePath || asset.webPath || '') : '';
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.dispatchEvent(new Event('change', { bubbles: true }));
        });
        field.__birthdayMediaTargetBound = true;
      }
      window.MediaField.attach(field);
    });
  }
`;

  js = replaceOnce(
    js,
    `\n\n  function currentParties() {`,
    `${helperBlock}\n  function currentParties() {`,
    'insert bindBirthdayMediaFields before currentParties'
  );

  const userSongNeedle = `<label>User-Song-Datei <input type="text" data-birthday-user-song placeholder="birthday/birthday_song_user.mp3 oder leer für Standard"></label>`;
  const userSongReplacement = `<label>User-Song-Datei <input type="text" data-birthday-user-song placeholder="media/birthday/general/birthday_song_user.mp3 oder leer für Standard"></label>
            <div class="birthday-mediafield-block" data-media-field data-module-key="birthday" data-category-key="general" data-allowed-types="audio" data-title="User-Song auswählen oder hochladen" data-birthday-media-target="[data-birthday-user-song]"></div>`;
  js = replaceOnce(js, userSongNeedle, userSongReplacement, 'renderUsers user song media field');

  const partySongNeedle = `<label>Song-Datei optional<input type="text" data-birthday-party-song placeholder="birthday/birthday_song_araglor_2.mp3 oder leer = User/Standard-Song"></label>`;
  const partySongReplacement = `<label>Song-Datei optional<input type="text" data-birthday-party-song placeholder="media/birthday/general/birthday_song_araglor_2.mp3 oder leer = User/Standard-Song"></label>
                <div class="birthday-mediafield-block" data-media-field data-module-key="birthday" data-category-key="general" data-allowed-types="audio" data-title="Party-Song auswählen oder hochladen" data-birthday-media-target="[data-birthday-party-song]"></div>`;
  js = replaceOnce(js, partySongNeedle, partySongReplacement, 'renderParties party song media field');

  const renderNeedle = `    bind();\n  }\n\n  function bind() {`;
  const renderReplacement = `    bind();\n    bindBirthdayMediaFields();\n  }\n\n  function bind() {`;
  js = replaceOnce(js, renderNeedle, renderReplacement, 'call bindBirthdayMediaFields after bind');

  fs.writeFileSync(birthdayJsPath, js, 'utf8');
}

function patchBirthdayCss() {
  backupOnce(birthdayCssPath);
  let css = fs.readFileSync(birthdayCssPath, 'utf8');
  if (css.includes('STEP274V birthday media field')) return;
  css += `

/* STEP274V birthday media field */
.birthday-mediafield-block{grid-column:1/-1;border:1px solid rgba(64,232,255,.18);background:rgba(64,232,255,.055);border-radius:14px;padding:10px;display:grid;gap:8px}
.birthday-mediafield-block .media-field-preview{border-color:rgba(255,255,255,.12);background:rgba(0,0,0,.18)}
.birthday-mediafield-block [data-media-field-open]{border-color:rgba(64,232,255,.35);background:rgba(64,232,255,.10)}
.birthday-mediafield-block [data-media-field-clear]{border-color:rgba(255,255,255,.14);background:rgba(255,255,255,.04)}
`;
  fs.writeFileSync(birthdayCssPath, css, 'utf8');
}

try {
  patchBirthdayJs();
  patchBirthdayCss();
  console.log(JSON.stringify({
    ok: true,
    step: 'STEP274V',
    patched: [
      'htdocs/dashboard/modules/birthday.js',
      'htdocs/dashboard/modules/birthday.css'
    ],
    backups: [
      'htdocs/dashboard/modules/birthday.js.bak-step274v',
      'htdocs/dashboard/modules/birthday.css.bak-step274v'
    ],
    notes: [
      'Legacy birthday upload buttons remain available.',
      'MediaField now fills existing birthday path inputs with selected asset.relativePath.',
      'No database schema change.'
    ]
  }, null, 2));
} catch (err) {
  fail(err && err.stack ? err.stack : String(err));
}
