# CURRENT SYSTEM STATUS

Stand: 2026-05-05

## Zweck

Diese Datei ist der aktuelle Einstiegspunkt fuer den Projektstand.

Historische Analyse-Snapshots liegen unter:

- `docs/system-inspection/2026-05-03/`
- `docs/backend/`
- `docs/dashboard/`
- `docs/overlays/`
- `docs/database/`

## Aktueller Arbeitsstand

Branch:

- `dev`

Repo:

- `D:\Git\stream-control-center`

Live:

- `D:\Streaming\stramAssets`

GitHub:

- `https://github.com/ForrestCGN/stream-control-center`

Aktueller Arbeitsgrundsatz:

- GitHub/dev ist Single Source of Truth.
- Live wird ueber `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd` aktualisiert.
- Nach abgeschlossenen Blocks werden `docs/current/CURRENT_SYSTEM_STATUS.md` und `project-state/*` aktualisiert.

## Zuletzt abgeschlossene Hauptbereiche

### Sound / Alert / TTS

- STEP171 Sound / Alert / Alert-TTS Fix-Kette
- STEP172 Sound / Alert / TTS Status Current

Referenz:

- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`

Kernstatus:

- Alert-Hauptsound laeuft ueber Sound-System.
- Alert-TTS laeuft als eigenes Sound-System-Item hinter Alert-Hauptsound.
- Chat-TTS wartet, bis Alert-Kette idle ist.
- Overlay bleibt bis nach Alert-TTS sichtbar.
- Sound-System bleibt Audio-Wahrheit.

### VIP / VIP-Sound Dashboard

Aktueller VIP-Dashboard-Block ist bis STEP175.4 abgeschlossen.

Neue zentrale Referenz:

- `project-state/STEP175_VIP_SOUND_BLOCK_HANDOFF_2026-05-05.md`

Abgeschlossene VIP-Schritte:

- STEP174.8 VIP-Uebersicht aufgeraeumt
- STEP174.9 VIP-Statistikseite ergaenzt
- STEP175.1 VIP-Sound-Verwaltung aufgeraeumt
- STEP175.2 VIP-Sound-Vorschau-Buttons ergaenzt
- STEP175.3 grosser Upload-Umbau verworfen / vereinfacht
- STEP175.4 VIP-Sound Upload-Auswahlfluss verbessert

Aktuelle VIP-Dateien:

- Backend: `backend/modules/vip_sound_overlay.js`
- Dashboard JS: `htdocs/dashboard/modules/vip.js`
- Dashboard CSS: `htdocs/dashboard/modules/vip.css`
- Overlay: `htdocs/overlays/vip_sound_overlay_v2.html`

Wichtig:

- Die Dashboard-Schritte STEP174.8 bis STEP175.4 haben keine Backend-Routen und keine Datenbank geaendert.
- VIP-Sound-Berechtigungen kommen ausschliesslich aus dem Twitch-Sync-Cache:
  - Twitch VIP => berechtigt
  - Twitch Mod => berechtigt
  - kein Twitch VIP/Mod => nicht berechtigt
- Lokale Overrides, Daily-Usage, Events und Historie sind keine Berechtigungsquelle.

Aktueller VIP-Dashboard-Zustand:

- Uebersicht zeigt kompakte Status-/Warnkarten.
- Statistik-Tab zeigt vorhandene Auswertungen aus bestehenden Routen.
- Sounds-Tab enthaelt Filter, Suche, Sortierung, Schnellzugriff auf fehlende Sounds, User-Auswahl, Upload-Auswahlfluss und Sound-Vorschau.
- VIPs-&-Mods-Tab zeigt Twitch-VIP-/Mod-Cache, Soundstatus und Sound-Vorschau.
- Events/Daily/Settings/Texte bleiben als getrennte Tabs erhalten.

## Aktueller Tagebuch/Todo-Stand

STEP177 vorbereitet/umgesetzt:

- Tagebuch/Todo Backend-Grundlage fuer DB-Settings und DB-Texte.
- `helper_texts.js` wurde um zentrale DB-Modultexte via `module_texts` erweitert.
- Tagebuch nutzt `tagebuch_settings` und `module_texts` mit JSON-Fallback.
- Todo nutzt `todo_settings` und `module_texts` mit JSON-Fallback.
- Neue Admin-Routen fuer spaetere Dashboard-Integration:
  - `GET/POST /api/tagebuch/admin/settings`
  - `GET/POST /api/tagebuch/admin/texts`
  - `GET/POST /api/todo/admin/settings`
  - `GET/POST /api/todo/admin/texts`
- Bestehende Tagebuch-/Todo-Routen bleiben erhalten.
- JSON-Dateien bleiben Seed/Fallback, keine Funktionalitaet entfernt.

Referenz:

- `project-state/STEP177_TAGEBUCH_TODO_DB_ADMIN_BACKEND_2026-05-05.md`


### Tagebuch / Todo

Aktueller Tagebuch-/Todo-Block ist bis STEP180 abgeschlossen.

Referenzen:

- `project-state/STEP176_TAGEBUCH_TODO_DB_DASHBOARD_AUDIT_2026-05-05.md`
- `project-state/STEP177_TAGEBUCH_TODO_DB_ADMIN_BACKEND_2026-05-05.md`
- `project-state/STEP178_TAGEBUCH_TODO_DASHBOARD_INTEGRATION_2026-05-05.md`
- `project-state/STEP179_TEXT_VARIANTS_EDITOR_2026-05-05.md`
- `project-state/STEP180_TEXT_VARIANTS_STATUS_UX_CLEANUP_2026-05-05.md`

Kernstatus:

- Tagebuch nutzt DB-Settings ueber `tagebuch_settings`.
- Todo nutzt DB-Settings ueber `todo_settings`.
- Tagebuch- und Todo-Texte liegen dashboardfaehig und variantenfaehig in `module_text_variants`.
- `module_texts` bleibt als Legacy-/Kompatibilitaetsschicht erhalten.
- JSON-Dateien bleiben Seed/Fallback.
- Dashboard-Module fuer Tagebuch und Todo sind im Community-Bereich aktiv.
- Texte werden als Kategorie-/Key-/Varianten-Editor dargestellt.
- Dashboard bearbeitet Settings/Texte nur ueber Backend-APIs.

## Aktive Dashboard-Module

- Stream-Desk
- Control-Uebersicht
- Alerts V2
- OBS Details
- Sound-System
- Hug-System
- Tagebuch
- Todo
- VIP-System
- Admin Configs

## Modulstandard

Fuer alle kuenftigen Dashboard-Module gilt als Zielstandard:

1. Dashboardfaehige Settings liegen primaer in DB.
2. Dashboardfaehige Texte liegen primaer in DB.
3. JSON-Dateien bleiben technische Config, Import oder Fallback.
4. Dashboard greift nie direkt auf SQLite oder Dateien zu.
5. Dashboard nutzt nur Backend-APIs.
6. Vorhandene Helper werden genutzt, keine Parallelstrukturen.
7. Harte Texte im Code sind nur Seed-Defaults, nicht dauerhafte Quelle.
8. Keine Funktionalitaet entfernen.

Aktuelle Helper-Lage:

- `helper_settings.js` ist DB-Settings-Standard.
- VIP nutzt DB-Texte modulnah.
- Alerts haben DB-Textbereiche.
- `helper_texts.js` unterstuetzt zentrale DB-Modultexte und Textvarianten via `module_texts`/`module_text_variants`; JSON bleibt Seed/Fallback.

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Vor Aenderungen echten Dateistand pruefen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Doku-Snapshots nicht ueberschreiben, sondern neue CURRENT-Dateien pflegen.
- STEP-Dokus nach jedem abgeschlossenen Block schreiben.

## Offene Punkte

### VIP

- Echte 7-/30-Tage-Statistik backendseitig ergaenzen.
- Upload-UX nur behutsam weiter verbessern.
- Sound-Vorschau optional erweitern:
  - Stop-Button
  - aktuelle Vorschau optisch markieren
  - lokale Dashboard-Lautstaerke
- Keine neue Berechtigungslogik fuer VIP-Sounds.

### System allgemein

- Alle Module auf DB-Settings/DB-Texte/Helper-Standard auditieren.
- Zentralen DB-Text-Helper planen.
- Provider-/Settings-Ausgaben maskieren, da Settings sensible Werte enthalten koennen.
- `liveAlert`/`livealert` Duplikat in Alert-Settings spaeter bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.

## Naechster empfohlener Schritt

1. Lokalen Stand pruefen:
   ```powershell
   cd D:\Git\stream-control-center
   git status --short
   git log -8 --oneline
   ```
2. Danach ein neues Modul oder den naechsten VIP-Feinschliff nur als kleinen STEP planen.


## STEP179 Text-Varianten-Editor

- `helper_texts.js` unterstuetzt jetzt zentrale DB-Textvarianten ueber `module_text_variants`.
- `module_texts` bleibt als Kompatibilitaets-/Legacy-Ebene erhalten.
- Tagebuch und Todo koennen mehrere aktive/inaktive Varianten pro Text-Key verwalten.
- Backend-Ausgaben waehlen zufaellig eine aktive Variante.
- Dashboard-Texte fuer Tagebuch/Todo sind kategoriebasiert: Kategorie auswaehlen, Text-Keys sehen, Varianten hinzufuegen/bearbeiten/deaktivieren/loeschen.
- JSON-Dateien bleiben Seed/Fallback und werden nicht entfernt.


## STEP180 Textvarianten Status-/UX-Cleanup

- Status-Ausgaben fuer Tagebuch/Todo benennen `module_text_variants` als aktive Varianten-Tabelle.
- `module_texts` bleibt Legacy-/Kompatibilitaetstabelle.
- Dashboard-Texteditor zeigt lesbarere Labels, technische Keys und kurze Hinweise pro Text-Key.
- Keine Backend-Funktionsrouten entfernt.
