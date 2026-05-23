'use strict';

/**
 * STEP274W FIX1 - Birthday MediaPicker Dashboard Patch
 *
 * Zweck:
 * - Repariert den teilweise angewendeten STEP274W.
 * - Backend-Import bleibt erhalten/idempotent.
 * - Dashboard Show/Medien nutzt den zentralen MediaPicker als Hauptweg.
 * - Alte Direktuploads bleiben eingeklappt als Legacy-Fallback.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const birthdayDashboardPath = path.join(repoRoot, 'htdocs', 'dashboard', 'modules', 'birthday.js');
const birthdayCssPath = path.join(repoRoot, 'htdocs', 'dashboard', 'modules', 'birthday.css');
const oldToolPath = path.join(repoRoot, 'tools', 'apply_step274w_birthday_mediapicker_import.js');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function patchOnce(content, marker, patchFn) {
  if (content.includes(marker)) return { content, changed: false };
  return { content: patchFn(content), changed: true };
}

function replaceRequired(content, search, replacement, label) {
  if (!content.includes(search)) {
    throw new Error(`${label}_not_found`);
  }
  return content.replace(search, replacement);
}

function patchApi(content) {
  if (content.includes("importMedia: '/api/birthday/admin/show/import-media'")) return content;

  const oldLine = "    resolveUser: '/api/birthday/admin/resolve-user'";
  const newLine = "    resolveUser: '/api/birthday/admin/resolve-user',\n    importMedia: '/api/birthday/admin/show/import-media'";
  return replaceRequired(content, oldLine, newLine, 'api_resolveUser_line');
}

function patchImportFunction(content) {
  const marker = 'STEP274W_FIX1_IMPORT_MEDIA_PICKER';
  if (content.includes(marker)) return content;

  const insertBefore = '\n\n  function currentParties() {';
  const fn = `

  // STEP274W_FIX1_IMPORT_MEDIA_PICKER
  async function importBirthdayShowMedia(kind) {
    const cleanKind = String(kind || '').trim();
    if (!cleanKind) throw new Error('Import-Typ fehlt.');
    if (!window.MediaPicker?.open) throw new Error('MediaPicker ist nicht verfügbar. Bitte Dashboard hart neu laden.');

    const cfg = {
      intro_video: {
        title: 'Birthday Intro-Video auswählen oder hochladen',
        allowedTypes: ['video', 'animation']
      },
      default_song: {
        title: 'Birthday Standardsong auswählen oder hochladen',
        allowedTypes: ['audio']
      },
      user_song: {
        title: 'Birthday User-Song auswählen oder hochladen',
        allowedTypes: ['audio']
      }
    }[cleanKind];

    if (!cfg) throw new Error('Unbekannter Birthday-Medientyp: ' + cleanKind);

    let login = '';
    if (cleanKind === 'user_song') {
      login = String(root?.querySelector('[data-birthday-import-login]')?.value || root?.querySelector('[data-birthday-upload-login]')?.value || root?.querySelector('[data-birthday-user-login]')?.value || '').trim();
      if (!login) throw new Error('Für User-Song bitte zuerst @User oder Twitch-Login eintragen.');
    }

    window.MediaPicker.open({
      moduleKey: 'birthday',
      categoryKey: 'general',
      allowedTypes: cfg.allowedTypes,
      title: cfg.title,
      onSelect: async (asset) => {
        if (!asset || !asset.id) return;
        try {
          state.error = '';
          state.notice = 'Birthday-Medium wird übernommen...';
          render();

          const result = await window.CGN.api(api.importMedia, {
            method: 'POST',
            body: JSON.stringify({
              kind: cleanKind,
              mediaId: asset.id,
              login
            })
          });

          state.notice = result?.message || 'Birthday-Medium übernommen.';
          await loadAll(true);
        } catch (err) {
          state.error = err.message || String(err);
          render();
        }
      }
    });
  }`;
  return replaceRequired(content, insertBefore, fn + insertBefore, 'currentParties_marker');
}

function patchRenderShowUploadBlock(content) {
  const marker = 'STEP274W_FIX1_SHOW_MEDIAPICKER_UI';
  if (content.includes(marker)) return content;

  const regex = /        <section class="birthday-card">\s*<h3>Medien hochladen<\/h3>[\s\S]*?          <p class="birthday-note">Dateinamen werden automatisch sauber gesetzt:[\s\S]*?<\/p>\s*        <\/section>/m;

  const replacement = `        <section class="birthday-card birthday-media-import-card">
          <h3>Medien auswählen / hochladen</h3>
          <p class="birthday-note">STEP274W_FIX1_SHOW_MEDIAPICKER_UI: Hauptweg ist jetzt der zentrale MediaPicker. Uploads landen zuerst in der Media-Registry und werden danach kontrolliert ins Birthday-/Sound-System übernommen.</p>

          <div class="birthday-media-import-grid">
            <button type="button" class="birthday-media-import-btn" data-birthday-import-media="intro_video">
              <strong>🎬 Intro-Video auswählen</strong>
              <span>MediaPicker · erlaubt Video/Animation</span>
            </button>
            <button type="button" class="birthday-media-import-btn" data-birthday-import-media="default_song">
              <strong>🔊 Standardsong auswählen</strong>
              <span>MediaPicker · erlaubt Audio</span>
            </button>
          </div>

          <div class="birthday-media-user-import">
            <label>User für eigenen Song<input type="text" data-birthday-import-login placeholder="@Araglor"></label>
            <button type="button" class="birthday-media-import-btn" data-birthday-import-media="user_song">
              <strong>🔊 User-Song auswählen</strong>
              <span>Erst User eintragen, dann MediaPicker öffnen</span>
            </button>
          </div>

          <details class="birthday-legacy-upload-fallback">
            <summary>Legacy-Direktupload anzeigen</summary>
            <div class="birthday-form">
              <label>Globales Intro-Video<input type="file" data-birthday-upload-file="intro_video" accept="video/webm,video/mp4,video/quicktime"></label>
              <button type="button" data-birthday-upload="intro_video" disabled title="Bitte zuerst eine Datei auswählen.">Intro-Video hochladen</button>
              <label>Standardsong<input type="file" data-birthday-upload-file="default_song" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4"></label>
              <button type="button" data-birthday-upload="default_song" disabled title="Bitte zuerst eine Datei auswählen.">Standardsong hochladen</button>
              <label>User für eigenen Song<input type="text" data-birthday-upload-login placeholder="@Araglor"></label>
              <label>User-Song<input type="file" data-birthday-upload-file="user_song" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4"></label>
              <button type="button" data-birthday-upload="user_song" disabled title="Bitte zuerst eine Datei auswählen.">User-Song hochladen</button>
            </div>
            <p class="birthday-note">Fallback nur nutzen, wenn der MediaPicker nicht verfügbar ist.</p>
          </details>
        </section>`;

  if (!regex.test(content)) {
    throw new Error('renderShow_upload_block_not_found_fix1');
  }
  return content.replace(regex, replacement);
}

function patchBind(content) {
  const marker = "data-birthday-import-media";
  const bindAlready = "root?.querySelectorAll('[data-birthday-import-media]')";
  if (content.includes(bindAlready)) return content;

  const target = "    root?.querySelectorAll('[data-birthday-upload-file]').forEach(input => input.addEventListener('change', updateBirthdayUploadFallbackButtons));";
  const insert = `    root?.querySelectorAll('[data-birthday-import-media]').forEach(btn => btn.addEventListener('click', () => {
      importBirthdayShowMedia(btn.dataset.birthdayImportMedia).catch(err => { state.error = err.message || String(err); render(); });
    }));
${target}`;
  return replaceRequired(content, target, insert, 'bind_upload_file_line');
}

function patchDashboard() {
  let content = read(birthdayDashboardPath);
  const before = content;

  content = patchApi(content);
  content = patchImportFunction(content);
  content = patchRenderShowUploadBlock(content);
  content = patchBind(content);

  if (content !== before) {
    write(birthdayDashboardPath, content);
    console.log('[patch] dashboard birthday MediaPicker import UI');
  } else {
    console.log('[skip] dashboard already patched');
  }
}

function patchCss() {
  let css = read(birthdayCssPath);
  const marker = 'STEP274W_FIX1 birthday MediaPicker import UI';
  if (css.includes(marker)) {
    console.log('[skip] css already patched');
    return;
  }

  css += `

/* STEP274W_FIX1 birthday MediaPicker import UI */
.birthday-media-import-card{background:linear-gradient(135deg,rgba(16,20,40,.86),rgba(42,20,68,.74))}
.birthday-media-import-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
.birthday-media-import-btn{display:grid;gap:4px;text-align:left;border:1px solid rgba(64,232,255,.28);background:rgba(64,232,255,.08);border-radius:14px;padding:13px 14px}
.birthday-media-import-btn:hover{background:rgba(64,232,255,.14);box-shadow:0 0 18px rgba(64,232,255,.12)}
.birthday-media-import-btn strong{font-size:14px}
.birthday-media-import-btn span{font-size:12px;color:var(--muted)}
.birthday-media-user-import{display:grid;gap:9px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08)}
.birthday-media-user-import label{display:grid;gap:5px;color:var(--muted);font-size:12px}
.birthday-media-user-import input{width:100%;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:rgba(0,0,0,.22);color:inherit;padding:9px}
.birthday-legacy-upload-fallback{margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:10px;background:rgba(0,0,0,.14)}
.birthday-legacy-upload-fallback summary{cursor:pointer;font-weight:800;color:var(--muted)}
.birthday-legacy-upload-fallback[open] summary{margin-bottom:10px;color:inherit}
@media(max-width:1000px){.birthday-media-import-grid{grid-template-columns:1fr}}
`;
  write(birthdayCssPath, css);
  console.log('[patch] dashboard birthday MediaPicker CSS');
}

function replaceBrokenOldTool() {
  if (!fs.existsSync(oldToolPath)) return;
  const content = read(oldToolPath);
  if (content.includes('STEP274W_FIX1_SUPERSEDED_STUB')) {
    console.log('[skip] old STEP274W tool already replaced with stub');
    return;
  }
  const stub = `'use strict';

/**
 * STEP274W_FIX1_SUPERSEDED_STUB
 *
 * Dieses alte STEP274W-Patchscript wurde ersetzt, weil es bei aktuellen
 * Birthday-Dashboard-Ständen zu empfindlich nach einem HTML-Block gesucht hat.
 * Bitte stattdessen ausführen:
 *
 *   node tools/apply_step274w_fix1_birthday_mediapicker_dashboard.js
 */

console.log(JSON.stringify({
  ok: true,
  step: 'STEP274W',
  supersededBy: 'STEP274W_FIX1',
  message: 'Dieses Script ist durch STEP274W_FIX1 ersetzt. Kein Patch ausgeführt.'
}, null, 2));
`;
  write(oldToolPath, stub);
  console.log('[patch] broken STEP274W tool replaced with valid stub');
}

function main() {
  patchDashboard();
  patchCss();
  replaceBrokenOldTool();

  console.log(JSON.stringify({
    ok: true,
    step: 'STEP274W_FIX1',
    patched: [
      'htdocs/dashboard/modules/birthday.js',
      'htdocs/dashboard/modules/birthday.css',
      'tools/apply_step274w_birthday_mediapicker_import.js'
    ],
    note: 'Danach stepdone ausfuehren, Backend/Dashboard neu laden und Birthday > Show/Medien testen.'
  }, null, 2));
}

main();
