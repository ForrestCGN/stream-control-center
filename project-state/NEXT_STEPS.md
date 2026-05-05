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

Der VIP-Dashboard-/VIP-Sound-Block ist nach STEP175.4 in einem brauchbaren Stand und mit STEP175.5 in den zentralen Dokus synchronisiert.

Aktuelle VIP-Referenz:

- `project-state/STEP175_VIP_SOUND_BLOCK_HANDOFF_2026-05-05.md`

Aktuelle Sound-/Alert-/TTS-Referenz:

- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`

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

## 2. VIP naechste sinnvolle Schritte

### 2.1 VIP-Statistik backendseitig erweitern

Ziel:

- echte 7-Tage-Auswertung
- echte 30-Tage-Auswertung
- Top User pro Zeitraum
- abgelehnte Events pro Zeitraum
- letzte Nutzung pro User backendseitig
- optional Query-Parameter wie:
  - `days=7`
  - `days=30`
  - `usageDate=YYYY-MM-DD`

Wichtig:

- keine neue Tabelle blind anlegen
- bestehende Tabellen verwenden:
  - `vip_sound_events`
  - `vip_sound_daily_usage`
- bestehende Route `/api/vip-sound/stats` erweitern oder saubere neue Zusatzroute bauen

### 2.2 VIP-Sound-Vorschau optional verbessern

Moeglich:

- Stop-Button
- aktuell laufende Vorschau optisch markieren
- lokale Dashboard-Lautstaerke
- kein Einfluss auf Sound-System
- kein Queue-Eintrag

### 2.3 VIP-Upload-UX nur behutsam weiter verbessern

Der grosse Upload-Block aus STEP175.3 wurde verworfen.

Kuenftig nur kleine Verbesserungen:

- Datei-Auswahl klarer anzeigen
- Upload-Erfolg klarer bestaetigen
- nach Upload gezielt Userstatus aktualisieren
- keine doppelte/ueberladene Upload-Karte

## 3. Modul-Audit: Texte / Settings / Helper vereinheitlichen

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

## 4. Zentralen DB-Text-Helper planen

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

## 5. Sensible Dashboard-Ausgaben maskieren

Ziel:

- Public-/Dashboard-Ausgaben duerfen keine sensiblen Werte im Klartext zeigen.
- Schreiben sensibler Werte nur ueber gesonderte, geschuetzte APIs.
- Audit-Logging spaeter einplanen.

## 6. Dashboard-Modulstandard definieren

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

## 7. Alerts-Modul spaeter behutsam splitten

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

## 8. Weitere offene Bereiche

- Fireworks spaeter neu aufbauen.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
