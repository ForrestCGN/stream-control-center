# CURRENT STATUS - stream-control-center

Stand: 2026-05-04

## Single Source of Truth

Repo:

- D:\Git\stream-control-center

GitHub:

- https://github.com/ForrestCGN/stream-control-center

Branch:

- dev

Live-System:

- D:\Streaming\stramAssets

Aktueller Doku-Einstieg:

- docs/current/CURRENT_SYSTEM_STATUS.md

## Verbindlicher GitHub-/Live-Workflow

- Gearbeitet wird immer auf GitHub/dev und im lokalen Repo `D:\Git\stream-control-center`.
- Live wird ueber `D:\Git\stream-control-center\tools\easy\` aktualisiert.
- Standard-Scripte:
  - `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`
  - `tools\easy\02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd`
  - `tools\easy\03_NUR_STATUS_PRUEFEN.cmd`
  - `tools\easy\04_BACKUP_ZURUECKSPIELEN.cmd`
- Wenn GitHub-/Toolausgaben grosse Dateien kuerzen oder nicht vollstaendig liefern, wird nicht geraten und nicht mit riskanten Patch-Scripten gearbeitet. Dann stellt Forrest die echte Datei aus Repo/Live bereit und diese Datei ist fuer die Bearbeitung massgeblich.

## Aktueller Arbeitsstand

Der aktuelle VIP-Backend-Block ist bis STEP040 abgeschlossen und fuer das spaetere Dashboard vorbereitet.

Zuletzt abgeschlossen:

- STEP026 VIP Target-Mod-Erkennung ueber Twitch-Helper umgesetzt
- STEP027 VIP-Default-Chattexte von Heimleitung auf Heimaufsicht umgestellt
- STEP028 VIP-Daily-Usage API vorbereitet
- STEP029 VIP-Daily-Usage API Semantik korrigiert
- STEP030 VIP-Referenzstand dokumentiert
- STEP031 VIP DB-Settings-Basis vorbereitet
- STEP032 VIP-Soundpfad/Dateiregel aus DB-Settings aktiv genutzt
- STEP033 VIP-Events-/Statistikbasis vorbereitet
- STEP034 VIP-Rollen-Fallbacks in DB verschoben
- STEP034.1 VIP-Rollen-Config-Pfad korrigiert
- STEP035 VIP-Text-API vorbereitet
- STEP036 Zentraler Settings-Helper vorbereitet
- STEP037 VIP nutzt zentralen `helper_settings.js`
- STEP038 VIP-Settings Write-API vorbereitet
- STEP039 VIP Admin-/Test-Routen vorbereitet
- STEP040 VIP Backend Reference / Dashboard Ready Status dokumentiert

## VIP-/Sound-/Overlay-Stand

Dokumentiert in:

- `project-state/STEP040_VIP_BACKEND_REFERENCE_DASHBOARD_READY_2026-05-04.md`

Aktueller Modulstand:

- `backend/modules/vip_sound_overlay.js`
- Live-Version getestet: `1.8.5`
- `htdocs/overlays/vip_sound_overlay_v2.html` ist die aktive OBS-VIP-Browserquelle.

Kernentscheidungen / aktueller Ablauf:

- Streamer.bot nimmt nur noch Befehle an und uebergibt Minimaldaten an Node.
- `!vip` nutzt Fetch URL zu `/api/vip-sound/command`.
- Streamer.bot sendet keinen VIP-Chattext mehr selbst.
- Streamer.bot startet kein VIP-Overlay mehr direkt.
- VIP-Command prueft Daily-Usage pro User/pro Stream-Tag.
- VIP-Sounddatei wird ueber DB-Settings aufgeloest:
  - `soundBaseDir`
  - `fileNameMode`
  - `fileExtension`
- Wenn Datei fehlt, wird keine Daily-Usage geschrieben.
- Wenn Datei existiert, wird `/api/sound/play` genutzt.
- Nur wenn das Sound-System akzeptiert, wird Daily-Usage geschrieben.
- Chat-Ausgabe erfolgt ueber `helper_chat_output` / Heimaufsicht-Bot.
- Response fuer Streamer.bot: `send=false`, `streamerbot_send="0"`, `chatMessage=""`.
- VIP-Override: Mods/Broadcaster duerfen fuer Zieluser erneut ausloesen.
- Override-/Zielrollen-Erkennung laeuft ueber:
  1. Twitch-Erkennung
  2. DB-Rollen-Fallbacks
  3. JSON-Import-/Fallback-Quelle
- Overlay V2 liest Visualdaten aus `sound_system.current.visual` bzw. Sound-System-WebSocket/Polling.

## VIP-Datenbanktabellen

Aktive VIP-Tabellen in `D:\Streaming\stramAssets\data\sqlite\app.sqlite`:

- `vip_sound_daily_usage`
- `vip_sound_message_templates`
- `vip_sound_settings`
- `vip_sound_events`
- `vip_sound_role_overrides`

Wichtig:

- `app.sqlite` niemals committen.
- Keine SQLite-Dateien ersetzen.
- Schemaaenderungen nur migrationssicher.

## VIP Dashboard-Ready APIs

Wichtige Routen:

- `GET /api/vip-sound/status`
- `GET /api/vip-sound/db/status`
- `GET /api/vip-sound/admin/summary`
- `GET/POST /api/vip-sound/command`
- `POST /api/vip-sound/test`
- `POST /api/vip-sound/admin/test`
- `GET /api/vip-sound/daily-usage`
- `GET /api/vip-sound/daily-usage/today`
- `POST /api/vip-sound/daily-usage/reset`
- `POST /api/vip-sound/daily-usage/reset-today`
- `GET/POST /api/vip-sound/admin/reset-daily`
- `GET /api/vip-sound/events`
- `GET /api/vip-sound/events/recent`
- `GET /api/vip-sound/stats`
- `GET /api/vip-sound/settings`
- `GET /api/vip-sound/config`
- `POST /api/vip-sound/settings/upsert`
- `POST /api/vip-sound/settings/delete`
- `POST /api/vip-sound/settings/reset-defaults`
- `GET /api/vip-sound/roles`
- `POST /api/vip-sound/roles/upsert`
- `POST /api/vip-sound/roles/delete`
- `POST /api/vip-sound/roles/import-config`
- `GET /api/vip-sound/texts`
- `GET /api/vip-sound/texts/event-keys`
- `POST /api/vip-sound/texts/upsert`
- `POST /api/vip-sound/texts/toggle`
- `POST /api/vip-sound/texts/delete`

## Dashboard-/Systemstandard

Fuer neue und bestehende Systeme gilt:

- Dashboard-faehige Werte primaer in Datenbank/Settings-Strukturen.
- JSON-Dateien nur fuer technische Configs, Imports oder Fallbacks.
- ENV/Secrets bleiben ausserhalb von DB und Repo.
- Dashboard liest/schreibt nur ueber Backend-APIs.
- Keine direkten Dashboard-Zugriffe auf SQLite oder Dateien.
- Bestehende Systeme spaeter gezielt pruefen und ggf. schrittweise angleichen.
- Keine Funktionalitaet entfernen.

## Doku-Struktur

Repo-Doku:

- `D:\Git\stream-control-center\docs`

Live-Doku:

- `D:\Streaming\stramAssets\docs`

Aktuelle Statusdatei:

- `docs/current/CURRENT_SYSTEM_STATUS.md`

Historische Analyse-Snapshots:

- `docs/backend/Backend_Systemuebersicht_2026-05-03.txt`
- `docs/dashboard/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt`
- `docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt`
- `docs/overlays/overlay_iststand_analyse.txt`
- `docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt`

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Vor Aenderungen echten Dateistand pruefen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Keine Backups/Altdateien committen.
- Historische Analyse-Snapshots nicht ueberschreiben.
- Aktuellen Stand in docs/current/CURRENT_SYSTEM_STATUS.md und project-state aktuell halten.
- Nach jedem abgeschlossenen Block STEP-Doku schreiben.

## Bewusst offen

- VIP-Dashboard in neuem Chat bauen.
- Dashboard-Modulstandard definieren.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Bestehende Systeme vor Dashboard-Bau pruefen und ggf. auf DB-/Settings-/API-Standard umbauen.
- Debug-Parameter `?debug=1` in OBS wieder entfernen, wenn nicht mehr gebraucht.
- Alte VIP-Action in Streamer.bot deaktiviert lassen oder spaeter nach Backup sauber entfernen.
- Fireworks spaeter neu aufbauen.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
