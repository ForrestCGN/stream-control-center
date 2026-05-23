'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const files = {
  media: path.join(root, 'backend', 'modules', 'media.js'),
  birthdayJs: path.join(root, 'htdocs', 'dashboard', 'modules', 'birthday.js'),
  birthdayCss: path.join(root, 'htdocs', 'dashboard', 'modules', 'birthday.css'),
  current: path.join(root, 'docs', 'current', 'CURRENT_SYSTEM_STATUS.md'),
  status: path.join(root, 'project-state', 'CURRENT_STATUS.md'),
  changelog: path.join(root, 'project-state', 'CHANGELOG.md'),
  next: path.join(root, 'project-state', 'NEXT_STEPS.md'),
  filesDoc: path.join(root, 'project-state', 'FILES.md')
};

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, content) { fs.writeFileSync(file, content, 'utf8'); }
function ensureFile(file) { if (!fs.existsSync(file)) throw new Error('missing_file:' + file); }
function log(msg) { console.log('[patch]', msg); }
function appendOnce(file, marker, text) {
  ensureFile(file);
  const old = read(file);
  if (old.includes(marker)) return false;
  write(file, old.replace(/\s*$/, '') + '\n\n' + text.trim() + '\n');
  return true;
}
function replaceOnce(content, search, replacement, label) {
  if (!content.includes(search)) throw new Error('anchor_not_found:' + label);
  return content.replace(search, replacement);
}

function patchMediaCategories() {
  ensureFile(files.media);
  let s = read(files.media);
  if (!s.includes("categoryKey: 'party-songs'")) {
    const anchor = "  { moduleKey: 'birthday', categoryKey: 'user-songs', label: 'Geburtstag / User-Songs', allowedTypes: ['audio'], isSystem: true },";
    const replacement = anchor + "\n  { moduleKey: 'birthday', categoryKey: 'party-songs', label: 'Geburtstag / Party-Songs', allowedTypes: ['audio'], isSystem: true },";
    s = replaceOnce(s, anchor, replacement, 'birthday_party_songs_category');
    write(files.media, s);
    log('media category birthday/party-songs added');
  } else {
    log('media category birthday/party-songs already present');
  }
}

function patchBirthdayDashboard() {
  ensureFile(files.birthdayJs);
  let s = read(files.birthdayJs);

  s = s.replace(
    'data-category-key="general" data-allowed-types="audio" data-title="User-Song auswählen oder hochladen" data-birthday-media-target="[data-birthday-user-song]"',
    'data-category-key="user-songs" data-allowed-types="audio" data-title="User-Song auswählen oder hochladen" data-birthday-media-target="[data-birthday-user-song]"'
  );
  s = s.replace(
    'placeholder="media/birthday/general/birthday_song_user.mp3 oder leer für Standard"',
    'placeholder="media/birthday/user-songs/birthday_song_user.mp3 oder leer für Standard"'
  );

  s = s.replace(
    'data-category-key="general" data-allowed-types="audio" data-title="Party-Song auswählen oder hochladen" data-birthday-media-target="[data-birthday-party-song]"',
    'data-category-key="party-songs" data-allowed-types="audio" data-title="Party-Song auswählen oder hochladen" data-birthday-media-target="[data-birthday-party-song]"'
  );
  s = s.replace(
    'placeholder="media/birthday/general/birthday_song_araglor_2.mp3 oder leer = User/Standard-Song"',
    'placeholder="media/birthday/party-songs/party_song_araglor.mp3 oder leer = User/Standard-Song"'
  );

  const oldNotice = "state.notice = result?.message || ('Birthday-Medium übernommen' + (cfg.categoryLabel ? ' · ' + cfg.categoryLabel : '') + '.');";
  const newNotice = `const selectedName = asset.label || asset.displayName || asset.fileName || ('mediaId=' + asset.id);\n          const selectedCategory = (asset.moduleKey || 'birthday') + '/' + (asset.categoryKey || cfg.categoryKey || 'general');\n          const userPart = login ? (' für @' + login.replace(/^@+/, '')) : '';\n          const soundPart = result?.relativePath ? (' · Sound-System: ' + result.relativePath) : '';\n          state.notice = result?.message || ('Übernommen: ' + selectedName + userPart + ' · Registry: ' + selectedCategory + soundPart);`;
  if (s.includes(oldNotice)) {
    s = s.replace(oldNotice, newNotice);
    log('birthday import success notice enhanced');
  } else if (!s.includes('const selectedCategory = (asset.moduleKey')) {
    throw new Error('notice_anchor_not_found');
  }

  s = s.replace(
    '<span>MediaPicker · erlaubt Video/Animation</span>',
    '<span>Upload-Ziel: birthday/intro · erlaubt Video/Animation</span>'
  );
  s = s.replace(
    '<span>MediaPicker · erlaubt Audio</span>',
    '<span>Upload-Ziel: birthday/default-song · erlaubt Audio</span>'
  );
  s = s.replace(
    '<span>Erst User eintragen, dann MediaPicker öffnen</span>',
    '<span>Upload-Ziel: birthday/user-songs · erst User eintragen</span>'
  );

  const oldNote = 'STEP274W_FIX1_SHOW_MEDIAPICKER_UI: Hauptweg ist jetzt der zentrale MediaPicker. Uploads landen zuerst in der Media-Registry und werden danach kontrolliert ins Birthday-/Sound-System übernommen.';
  const newNote = 'Hauptweg ist der zentrale MediaPicker. Neue Uploads landen direkt in der passenden Media-Registry-Kategorie und werden danach kontrolliert ins Birthday-/Sound-System übernommen.';
  s = s.replace(oldNote, newNote);

  const marker = 'STEP274Y_BIRTHDAY_MEDIAPICKER_UX_HINTS';
  if (!s.includes(marker)) {
    const anchor = `          <div class="birthday-media-user-import">\n            <label>User für eigenen Song<input type="text" data-birthday-import-login placeholder="@Araglor"></label>`;
    const replacement = `          <div class="birthday-media-path-hints" data-step="${marker}">\n            <div><strong>Intro</strong><code>htdocs/assets/media/birthday/intro/</code></div>\n            <div><strong>Standard</strong><code>htdocs/assets/media/birthday/default-song/</code></div>\n            <div><strong>User-Songs</strong><code>htdocs/assets/media/birthday/user-songs/</code></div>\n          </div>\n\n${anchor}`;
    s = replaceOnce(s, anchor, replacement, 'media_path_hints_anchor');
    log('birthday media path hints inserted');
  } else {
    log('birthday media path hints already present');
  }

  write(files.birthdayJs, s);
}

function patchBirthdayCss() {
  const marker = 'STEP274Y - Birthday MediaPicker UX cleanup';
  const css = `
/* ${marker} */
.birthday-media-path-hints{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0;padding:10px;border:1px solid rgba(64,232,255,.16);border-radius:14px;background:rgba(64,232,255,.045)}
.birthday-media-path-hints div{display:grid;gap:3px;min-width:0}
.birthday-media-path-hints strong{font-size:12px;color:#dffaff}
.birthday-media-path-hints code{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--muted);background:rgba(0,0,0,.18);border-radius:8px;padding:5px 7px}
.birthday-media-import-card .birthday-note{line-height:1.45}
@media(max-width:1000px){.birthday-media-path-hints{grid-template-columns:1fr}}
`;
  if (appendOnce(files.birthdayCss, marker, css)) log('birthday ux css appended');
  else log('birthday ux css already present');
}

function patchDocs() {
  appendOnce(files.current, 'STEP274Y', `
### STEP274Y - Birthday MediaPicker UX-Cleanup
- Birthday-MediaPicker zeigt die Zielkategorien direkt an.
- User-Song-/Party-Song-MediaFields nutzen jetzt birthday/user-songs bzw. birthday/party-songs statt general.
- Erfolgsmeldung nach Übernahme zeigt Registry-Kategorie und Sound-System-Zielpfad.
- Neue Kategorie birthday/party-songs wurde im Media-Core ergänzt.
`);
  appendOnce(files.status, 'STEP274Y', `
## STEP274Y - Birthday MediaPicker UX-Cleanup
Status: vorbereitet/anzuwenden. Der Birthday-MediaPicker ist jetzt klarer kategorisiert: intro, default-song, user-songs und party-songs.
`);
  appendOnce(files.changelog, 'STEP274Y', `
## STEP274Y - Birthday MediaPicker UX-Cleanup
- Birthday Dashboard: Zielpfade/Kategorien im Show/Medien-Bereich sichtbar gemacht.
- Birthday Dashboard: User-Song MediaField auf birthday/user-songs gestellt.
- Birthday Dashboard: Party-Song MediaField auf birthday/party-songs gestellt.
- Media Backend: Standardkategorie birthday/party-songs ergänzt.
`);
  appendOnce(files.next, 'STEP274Y', `
## Nach STEP274Y
- Birthday Show/Medien im Browser hart neu laden.
- User-Song über Birthday-Button hochladen und prüfen: Registry-Pfad birthday/user-songs, Sound-Kopie assets/sounds/birthday/.
- Party-Song MediaField prüfen: Upload-Ziel birthday/party-songs.
`);
  appendOnce(files.filesDoc, 'STEP274Y', `
## STEP274Y betroffene Dateien
- backend/modules/media.js
- htdocs/dashboard/modules/birthday.js
- htdocs/dashboard/modules/birthday.css
- docs/dashboard/BIRTHDAY_MEDIAPICKER_UX_CLEANUP.md
- project-state/STEP274Y.md
- tools/apply_step274y_birthday_mediapicker_ux_cleanup.js
`);
}

function main() {
  patchMediaCategories();
  patchBirthdayDashboard();
  patchBirthdayCss();
  patchDocs();
  console.log('[patch] STEP274Y Birthday MediaPicker UX-Cleanup applied');
}

main();
