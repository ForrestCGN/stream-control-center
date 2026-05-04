# NEXT STEPS - stream-control-center

Stand: 2026-05-04

## Wichtigster Grundsatz

Vor jedem neuen STEP:

1. `tools\easy\03_NUR_STATUS_PRUEFEN.cmd` oder `git status --short` pruefen.
2. docs/current/CURRENT_SYSTEM_STATUS.md lesen.
3. project-state/CURRENT_STATUS.md lesen.
4. Reale Dateien pruefen, keine Annahmen.
5. Wenn GitHub/Toolausgaben grosse Dateien kuerzen, echte Datei von Forrest anfordern und diese als Basis nutzen.
6. Kleine Aenderung planen.
7. Nach Aenderung testen, dokumentieren, committen, pushen und Live ueber `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd` aktualisieren.

## Aktuell naechste empfohlene Arbeitspakete

### 1. STEP047 live im Browser bestaetigen

Aktueller Stand:

- VIP-Dashboard-Basismodul wurde im Repo vorbereitet.
- `node -c htdocs/dashboard/modules/vip.js` war erfolgreich.
- VIP-APIs wurden erfolgreich getestet:
  - `GET /api/vip-sound/admin/summary`
  - `GET /api/vip-sound/settings`
  - `GET /api/vip-sound/texts?limit=5`

Noch offen:

- Live-Deploy ueber `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`, falls noch nicht erfolgt.
- Browser-Test:
  - Dashboard oeffnen.
  - Community -> VIP-System.
  - Statuskarten laden.
  - Settings sichtbar.
  - Texte sichtbar.
  - Rollen sichtbar.
  - Events sichtbar.

---

### 2. Modul-Audit: Texte / Settings / Helper vereinheitlichen

Ziel:

Alle Module sollen langfristig gleich aufgebaut sein und dieselben Helper/Muster nutzen.

Pruefen pro Modul:

- Wo liegen Settings?
- Liegen dashboardfaehige Settings in DB?
- Wo liegen Texte?
- Liegen dashboardfaehige Texte in DB?
- Gibt es harte Texte im Code?
- Gibt es JSON-Texte?
- Welche Helper werden genutzt?
- Gibt es eigene Sonderlogik oder Parallelstrukturen?
- Welche APIs fehlen fuer Dashboard-Bearbeitung?

Relevante Module:

- VIP
- Sound-System
- Alerts
- TTS
- Hug
- Messages/Rotator
- Tagebuch
- Todo
- OBS/Scene-Control
- Twitch/Presence
- Overlay-Chat
- Challenge
- Deathcounter

Wichtiger Befund:

- `helper_settings.js` ist bereits DB-Settings-Standard.
- VIP nutzt DB-Texte ueber `vip_sound_message_templates`.
- Alerts haben DB-Textbereiche (`alert_text_variants`, `alert_chat_blocks`).
- `helper_texts.js` ist aktuell noch JSON-basiert.

Empfohlener Folge-STEP:

- `STEP048_MODULE_TEXT_SETTINGS_AUDIT_2026-05-04`

---

### 3. Zentralen DB-Text-Helper planen

Ziel:

Ein einheitlicher Helper fuer modulbasierte DB-Texte, damit neue und migrierte Module denselben Standard nutzen.

Moegliche Richtung:

- `backend/modules/helpers/helper_module_texts.js`

oder saubere Erweiterung von:

- `backend/modules/helpers/helper_texts.js`

Ziel-Funktionen:

- `ensureTextTable(tableName)`
- `seedTextDefaults(tableName, defaults)`
- `listTexts(tableName, filters)`
- `getText(tableName, key/style)`
- `pickText(tableName, key/style)`
- `renderText(template, context)`
- `upsertText(tableName, ...)`
- `toggleText(tableName, id)`
- `deleteText(tableName, id)`

Wichtig:

- Keine vorhandenen VIP-/Alert-Texte verlieren.
- Keine Massenmigration ohne Audit.
- Harte Texte im Code nur als Seed-Defaults.

---

### 4. VIP-Song-Upload separat bauen

Ziel:

VIP-Sounds sollen wie Alert-Sounds ueber das Dashboard hochladbar werden.

Wichtig:

- Nicht in STEP047 enthalten.
- Erst Alert-Upload und `helper_media.js` als Basis nutzen.
- Keine zweite wilde Upload-Parallelstruktur.

Bekannter Befund:

- Alert-Upload nutzt aktuell `multer` direkt in `backend/modules/alert_system.js`.
- `helper_media.js` hat bereits:
  - sichere Pfadpruefung
  - erlaubte Audio-Endungen
  - ffprobe/Dauer-Lesen
- `helper_media.js` hat noch keinen generischen Upload-Helper.

Empfohlene Richtung:

- Erst Helper-/Upload-Standard planen.
- Dann VIP-Upload-Route bauen.
- Danach Dashboard-Upload-Feld in VIP ergaenzen.

---

### 5. TTS / Sound-System / Alerts dashboardfaehig machen

Aktueller Stand:

- Chat-TTS laeuft ueber Sound-System.
- TTS-Overlay zeigt Sound-System-Visual-State nach VIP-Prinzip.
- Google fuer Broadcaster/Mods/VIPs funktioniert.
- Piper fuer Subscriber funktioniert.
- Ko-fi Donation-TTS und Tipeee Donation-TTS sind aktiviert/getestet.
- Alert-Sound wird seit STEP046 frueh in Sound-System-Queue eingereiht.
- Sound-System-Prio funktioniert mit `sortByPriority=true`, `allowParallel=false`, `maxParallel=1`.

Ziel:

- TTS-/Alert-TTS-/Sound-System-Werte im Dashboard anzeigen und bearbeiten.
- Dashboard schreibt nur ueber Backend-APIs.
- Dashboardfaehige Werte primaer in DB/Settings.
- JSON bleibt fuer technische Fallbacks/Imports.
- Keine direkten Datei- oder SQLite-Zugriffe aus dem Dashboard.

---

### 6. Alert-Sound + Alert-TTS Kopplung pruefen

Noch gezielt pruefen:

- Ko-fi mit aktivem Alert-TTS: Alert-Sound -> Alert-TTS -> Chat-TTS.
- Tipeee mit aktivem Alert-TTS: Alert-Sound -> Alert-TTS -> Chat-TTS.
- Kein anderes Sound-Item darf zwischen Alert-Sound und dessen Alert-TTS rutschen, wenn diese logisch zusammengehoeren.

Falls noetig:

- Alert-TTS als gekoppelte Folgeausgabe des Alert-Sounds behandeln.
- Sound-System bleibt Audio-Wahrheit.

---

### 7. Provider-/Settings-Ausgaben maskieren

Problem:

- `/api/alerts/settings` kann Provider-Keys/Secrets enthalten.
- Dashboard darf Secrets nicht im Klartext anzeigen.

Ziel:

- Public-/Dashboard-Ausgabe maskiert sensible Felder.
- Schreiben von Secrets nur ueber gesonderte, geschuetzte API.
- Audit-Logging spaeter einplanen.

---

### 8. Dashboard-Modulstandard definieren

Ziel:

- Einheitlicher Aufbau fuer Dashboard-Module.
- Klare Struktur fuer init/load/render/bindActions.
- Einheitliches API-Verhalten.
- Einheitliche Loading/Error/Empty-States.
- Einheitliche Config-Strategie.

Betroffene Bereiche:

- htdocs/dashboard/app.js
- htdocs/dashboard/modules/*.js
- docs/dashboard/
- docs/current/CURRENT_SYSTEM_STATUS.md

---

### 9. Fireworks spaeter neu aufbauen

Aktueller Zustand:

- Fireworks-Routen sind doppelt registriert.
- Dokumentiert in STEP008.
- Kein kurzfristiger Umbau.

Spaeterer Zielzustand:

- Fireworks vollstaendig in eigenes Modul.
- server.js von Fireworks-Spezialrouten befreien.
- Einheitliches /api/fireworks/* System.
- WebSocket-Broadcast zentralisieren.

---

### 10. Hug-Textbearbeitung spaeter sauber neu planen

Aktueller Zustand:

- Hug-System laeuft.
- Dashboard-Hug ist funktionierender Live-Stand.

Spaeterer Zielzustand:

- Rechte-/Rollenpruefung.
- Audit-Logging.
- Nutzung vorhandener Helper.
- Kein Parallelmodul.

---

### 11. Alerts-Modul spaeter behutsam splitten

Aktueller Zustand:

- `alert_system.js` ist gross und funktionsreich.
- Nicht blind umbauen.

Spaeterer Zielzustand:

- alerts.api.js
- alerts.rules.js
- alerts.assets.js
- alerts.texts.js
- alerts.presets.js
- alerts.history.js

Wichtig:

- Nur schrittweise.
- Erst Tests und Doku.
