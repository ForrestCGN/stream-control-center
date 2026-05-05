# NEXT STEPS - stream-control-center

Stand: 2026-05-05

## Wichtigster Grundsatz

Vor jedem neuen STEP:

1. `tools\easy\03_NUR_STATUS_PRUEFEN.cmd` oder `git status --short` pruefen.
2. `docs/current/CURRENT_SYSTEM_STATUS.md` lesen.
3. `project-state/CURRENT_STATUS.md` lesen.
4. Reale Dateien pruefen, keine Annahmen.
5. Wenn GitHub/Toolausgaben grosse Dateien kuerzen, echte Datei von Forrest anfordern und diese als Basis nutzen.
6. Kleine Aenderung planen.
7. Nach Aenderung testen, dokumentieren, committen, pushen und Live ueber `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd` aktualisieren.

## Aktueller Ausgangspunkt

Der Sound-/Alert-/TTS-Block ist nach den Step171/172-Fixes wieder lauffaehig und dokumentiert.

Aktuelle Referenz:

- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`

Live bestaetigt:

- `alert_system` Version `3`
- `alert_system` Step `171`
- Queue leer
- Current null
- Overlay-Client verbunden

Wichtige Fix-Kette:

- Alert-Hauptsound ueber Sound-System
- Alert-TTS als eigenes Sound-System-Item hinter Alert-Hauptsound
- Chat-TTS wartet bis Alert-Kette idle ist
- Overlay bleibt bis nach Alert-TTS sichtbar
- Sound-System bleibt Audio-Wahrheit

## 1. Lokalen Stand nach Doku-Aktualisierung ziehen

Nach dieser Doku-Aktualisierung lokal ausfuehren:

```powershell
cd D:\Git\stream-control-center
git pull origin dev
git status --short
git log -8 --oneline
```

Danach optional Live-Doku deployen:

```powershell
.\tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd
```

## 2. Dashboard-Arbeit fortsetzen

Aktive Dashboard-Module:

- Stream-Desk
- Control-Uebersicht
- Alerts V2
- OBS Details
- Sound-System
- Hug-System
- VIP-System
- Admin Configs

Naechster fachlicher Fokus:

- VIP-System weiter ins Dashboard integrieren.
- VIP-Song-Upload nach Alert-Upload-/Helper-Standard bauen.
- Modul-Audit fuer DB-Settings/DB-Texte/Helper-Nutzung starten.

## 3. VIP-Song-Upload separat bauen

Ziel:

VIP-Sounds sollen wie Alert-Sounds ueber das Dashboard hochladbar werden.

Wichtig:

- Alert-Upload und `helper_media.js` als Basis nutzen.
- Keine zweite Upload-Parallelstruktur.
- Dashboard greift nur auf Backend-APIs zu.
- Upload-Ziel fuer VIP-Sounds ist aktuell `htdocs/assets/sounds/vip/`.
- Aktive VIP-Sound-Settings kommen aus DB.

Empfohlene Richtung:

1. Alert-Upload-Muster genau pruefen.
2. Entscheiden, ob kleiner VIP-spezifischer Upload zuerst reicht oder ob ein generischer Upload-Helper sinnvoller ist.
3. VIP-Upload-Route bauen.
4. Dashboard-Upload-Feld im VIP-Modul ergaenzen.
5. Test mit echter MP3.

## 4. Modul-Audit: Texte / Settings / Helper vereinheitlichen

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

## 5. Zentralen DB-Text-Helper planen

Ziel:

Ein einheitlicher Helper fuer modulbasierte DB-Texte, damit neue und migrierte Module denselben Standard nutzen.

Moegliche Richtung:

- `backend/modules/helpers/helper_module_texts.js`

oder saubere Erweiterung von:

- `backend/modules/helpers/helper_texts.js`

Wichtig:

- Keine vorhandenen VIP-/Alert-Texte verlieren.
- Keine Massenmigration ohne Audit.
- Harte Texte im Code nur als Seed-Defaults.

## 6. Sensible Dashboard-Ausgaben maskieren

Ziel:

- Public-/Dashboard-Ausgaben duerfen keine sensiblen Werte im Klartext zeigen.
- Schreiben sensibler Werte nur ueber gesonderte, geschuetzte APIs.
- Audit-Logging spaeter einplanen.

## 7. Dashboard-Modulstandard definieren

Ziel:

- Einheitlicher Aufbau fuer Dashboard-Module.
- Klare Struktur fuer init/load/render/bindActions.
- Einheitliches API-Verhalten.
- Einheitliche Loading/Error/Empty-States.
- Einheitliche Config-Strategie.

Betroffene Bereiche:

- `htdocs/dashboard/app.js`
- `htdocs/dashboard/modules/*.js`
- `docs/dashboard/`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## 8. Alerts-Modul spaeter behutsam splitten

Aktueller Zustand:

- `alert_system.js` ist gross und funktionsreich.
- Nicht blind umbauen.

Spaeterer Zielzustand:

- `alerts.api.js`
- `alerts.rules.js`
- `alerts.assets.js`
- `alerts.texts.js`
- `alerts.presets.js`
- `alerts.history.js`

Wichtig:

- Nur schrittweise.
- Erst Tests und Doku.

## 9. Weitere offene Bereiche

- Fireworks spaeter neu aufbauen.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
