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
- Live wird nicht mehr ueber alte Root-Scripte aktualisiert, sondern ueber:
  - `D:\Git\stream-control-center\tools\easy\`
- Standard-Scripte:
  - `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`
  - `tools\easy\02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd`
  - `tools\easy\03_NUR_STATUS_PRUEFEN.cmd`
  - `tools\easy\04_BACKUP_ZURUECKSPIELEN.cmd`
- Wenn GitHub-/Toolausgaben grosse Dateien kuerzen oder nicht vollstaendig liefern, wird nicht geraten und nicht mit riskanten Patch-Scripten gearbeitet. Dann stellt Forrest die echte Datei aus Repo/Live bereit und diese Datei ist fuer die Bearbeitung massgeblich.

## Aktueller Arbeitsstand

Der aktuelle Stand nach STEP031 ist fuer GitHub/dev vorbereitet.

Zuletzt abgeschlossen:

- STEP005 OBS API-Aliase /api/obs/*
- STEP006 OBS Dashboard Leserouten auf /api/obs/*
- STEP007 Mojibake in sound/adminconfigs repariert
- STEP008 Fireworks-Doppelroute dokumentiert, kein Umbau
- STEP010 OBS Dashboard Aktionen auf /api/obs/*
- STEP011 Doku-Struktur in Repo und Live eingefuehrt
- STEP015 VIP-/Sound-/Overlay-Planung dokumentiert
- STEP016 VIP-Daily-Usage und DB-Message-Templates vorbereitet
- STEP016.1 VIP-Chat-Ausgabe auf helper_chat_output/Heimleitungs-Bot umgestellt
- STEP017 VIP-Sounds ueber Sound-System vor Daily-Usage queued
- STEP019 VIP Sound Override dokumentiert und Projektstatus aktualisiert
- STEP020 VIP Override live getestet
- STEP021 Sound-System RequestId in VIP-Response gefixt
- STEP022 Streamer.bot VIP-Argumente geprueft
- STEP023 VIP Streamer.bot -> Sound-System -> Overlay V2 getestet
- STEP026 VIP Target-Mod-Erkennung ueber Twitch umgesetzt
- STEP027 VIP-Chat-Wording von Heimleitung auf Heimaufsicht angepasst
- STEP028 VIP-Daily-Usage API fuer Tests/Dashboard vorbereitet
- STEP029 VIP-Daily-Usage API-Semantik korrigiert
- STEP030 VIP-Referenzstand dokumentiert
- STEP031 VIP-DB-Settings-Basis vorbereitet
- STEP032 VIP-Soundpfad und Dateiregel aus DB-Settings aktiv genutzt
- STEP029 VIP-Daily-Usage API-Semantik korrigiert
- STEP030 VIP-Referenzstand dokumentiert
- STEP031 VIP-DB-Settings-Basis vorbereitet
- STEP026 VIP Target-Mod-Erkennung ueber Twitch-Helper umgesetzt
- STEP027 VIP-Default-Chattexte von Heimleitung auf Heimaufsicht umgestellt
- STEP024 VIP-Overlay-Texte aus SQLite bestaetigt
- STEP025 VIP-Zielrollen-Fallback per config/vip_sound_roles.json vorbereitet
- STEP026 VIP-Twitch-Rollenhelper fuer echte Mod-Erkennung vorbereitet

## Repo/Live-Abgleich

Zuletzt fuer STEP023:

- Echte Streamer.bot-Action fuer `!vip` neu auf Fetch URL zu `/api/vip-sound/command` aufgebaut.
- OBS-Browserquelle auf `vip_sound_overlay_v2.html` gesetzt.
- Live-Test erfolgreich: Sound-System startete VIP-Sound, OBS zeigte Overlay V2, danach alles wieder idle.
- Code wurde in STEP023 nicht geaendert.
- GitHub/dev wurde mit der STEP023-Doku aktualisiert.
- Keine SQLite-/Secret-/Backup-Dateien committed.

## VIP-/Sound-/Overlay-Stand

Dokumentiert in:

- project-state/STEP015_VIP_SOUND_OVERLAY_PLAN_2026-05-03.md
- project-state/STEP017_VIP_SOUND_SYSTEM_QUEUE_2026-05-03.md
- project-state/STEP019_VIP_SOUND_OVERRIDE_2026-05-04.md
- project-state/STEP020_VIP_OVERRIDE_LIVE_TEST_2026-05-04.md
- project-state/STEP021_SOUND_SYSTEM_REQUEST_ID_2026-05-04.md
- project-state/STEP022_STREAMERBOT_VIP_ARGS_2026-05-04.md
- project-state/STEP023_VIP_STREAMERBOT_SOUNDSYSTEM_OVERLAY_2026-05-04.md
- project-state/STEP026_VIP_TWITCH_ROLE_HELPER_2026-05-04.md
- project-state/STEP027_VIP_HEIMAUFSICHT_TEXTS_2026-05-04.md
- project-state/STEP028_VIP_DAILY_USAGE_API_2026-05-04.md
- project-state/STEP029_VIP_DAILY_USAGE_API_FIX_2026-05-04.md
- project-state/STEP030_VIP_REFERENCE_STATUS_2026-05-04.md
- project-state/STEP031_VIP_DB_SETTINGS_BASE_2026-05-04.md
- project-state/STEP032_VIP_SOUND_FILE_SETTINGS_ACTIVE_2026-05-04.md
- project-state/STEP028_VIP_DAILY_USAGE_API_2026-05-04.md
- project-state/STEP029_VIP_DAILY_USAGE_API_FIX_2026-05-04.md
- project-state/STEP030_VIP_REFERENCE_STATUS_2026-05-04.md
- project-state/STEP031_VIP_DB_SETTINGS_BASE_2026-05-04.md

Aktueller Modulstand:

- backend/modules/vip_sound_overlay.js
- Version: 1.7.6
- htdocs/overlays/vip_sound_overlay_v2.html ist die aktive OBS-VIP-Browserquelle.

Kernentscheidungen / aktueller Ablauf:

- Streamer.bot nimmt nur noch Befehle an und uebergibt Minimaldaten an Node.
- `!vip` nutzt Fetch URL zu `/api/vip-sound/command`.
- Streamer.bot sendet keinen VIP-Chattext mehr selbst.
- Streamer.bot startet kein VIP-Overlay mehr direkt.
- VIP-Command prueft Daily-Usage pro User/pro Stream-Tag.
- VIP-Command sucht Sounddateien jetzt ueber DB-Setting `soundBaseDir`, Fallback bleibt `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`.
- Dateiregel kommt jetzt aus DB-Settings `fileNameMode` + `fileExtension`, Fallback bleibt `Anzeigename.mp3`.
- Wenn Datei fehlt, wird keine Daily-Usage geschrieben.
- Wenn Datei existiert, wird `/api/sound/play` genutzt.
- Nur wenn das Sound-System akzeptiert, wird Daily-Usage geschrieben.
- Chat-Ausgabe erfolgt ueber helper_chat_output / Heimleitungs-Bot.
- Sichtbare VIP-/Mod-Chattexte nutzen jetzt `Heimaufsicht`; die interne SQLite-Style-ID `heimleitung` bleibt fuer Kompatibilitaet bestehen.
- Response fuer Streamer.bot: `send=false`, `streamerbot_send="0"`, `chatMessage=""`.
- VIP-Override: Mods/Broadcaster duerfen fuer Zieluser erneut ausloesen.
- Override-Rollen werden ueber `VIP_OVERRIDE_ALLOWED_ROLES` gesteuert.
- Standardrollen: `moderator,mod,broadcaster`.
- `soundSystemRequestId` wird korrekt aus der Sound-System-Response uebernommen.
- Overlay V2 liest Visualdaten aus `sound_system.current.visual` bzw. Sound-System-WebSocket/Polling.

STEP023 Ergebnis:

- `!vip @araglor` startete den Sound ueber `sound_system`.
- `sound_system.current.visual.module = vip_sound_overlay` war gesetzt.
- OBS zeigte VIP Overlay V2 korrekt an.
- Chat-Ausgabe kam ueber Heimaufsicht/Bot.
- Nach Soundende war `sound_system.current = null`, Queue leer und `device.lastOk = true`.
- `vip-sound-overlay/state` bleibt fuer Overlay V2 bewusst idle, weil V2 direkt Sound-System-Daten nutzt.


STEP028 Ergebnis:

- VIP-Daily-Usage kann ueber API angezeigt und fuer Tests geloescht werden.
- Neue Routen: `/api/vip-sound/daily-usage/today`, `/api/vip-sound/daily-usage/reset-today`, `/api/vip-sound/daily-usage/reset`.
- Temporäre Node-Scripte zum Tages-Reset sind nicht mehr noetig.

STEP029 Ergebnis:

- `/api/vip-sound/daily-usage` zeigt ohne Filter alle Daily-Usage-Eintraege.
- `/api/vip-sound/daily-usage/today` zeigt nur den aktuellen Tag.
- `/api/vip-sound/daily-usage/reset` loescht ohne Filter alle Eintraege und optional nach Datum/Login/SoundType.
- `/api/vip-sound/daily-usage/reset-today` loescht nur den aktuellen Tag, optional nach Login/SoundType.
- Automatische Retention bleibt bewusst offen und soll spaeter ueber Config/Dashboard einstellbar werden.

## Doku-Struktur

Repo-Doku:

- D:\Git\stream-control-center\docs

Live-Doku:

- D:\Streaming\stramAssets\docs

Aktuelle Statusdatei:

- docs/current/CURRENT_SYSTEM_STATUS.md

Historische Analyse-Snapshots:

- docs/backend/Backend_Systemuebersicht_2026-05-03.txt
- docs/dashboard/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt
- docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt
- docs/overlays/overlay_iststand_analyse.txt
- docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt

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

- Debug-Parameter `?debug=1` in OBS wieder entfernen, wenn nicht mehr gebraucht.
- Alte VIP-Action in Streamer.bot deaktiviert lassen oder spaeter nach Backup sauber entfernen.
- Legacy-Routen `/api/vip-sound/enqueue` und `/api/vip-sound-overlay/enqueue` vorerst fuer Kompatibilitaet behalten, aber nicht mehr fuer normalen `!vip` nutzen.
- VIP-Soundpfad ueber DB/Dashboard konfigurierbar machen.
- VIP-Dashboard fuer Texte/Settings.
- Fireworks spaeter neu aufbauen.
- Dashboard-Modulstandard definieren.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
- tools/sync_streamassets_to_repo.ps1 spaeter pruefen.


## STEP026 vorbereitet - VIP Twitch-Rollenhelper

Ziel:

- `!vip @araglor` soll automatisch als Mod-Sound laufen, wenn Twitch `araglor` als Moderator erkennt.
- Die Datei `config/vip_sound_roles.json` bleibt als Fallback/Override erhalten.

Geaenderte/Neue Dateien:

- `backend/modules/vip_sound_overlay.js`
  - Version `1.7.4`
  - nutzt `helper_twitch_roles.js`
  - `detectSoundTypeForTarget()` prueft zuerst Twitch, danach die lokale Rollen-Config
- `backend/modules/helpers/helper_twitch_roles.js`
  - liest `TWITCH_CLIENT_ID` aus ENV
  - liest User-Token aus `D:/Streaming/stramAssets/secrets/tokens/twitch_user.json`
  - nutzt `TWITCH_BROADCASTER_ID`, Fallback `127709954`
  - prueft `/helix/users` und `/helix/moderation/moderators`
  - cached Ergebnisse 10 Minuten
- `config/vip_sound_roles.json`
  - bleibt Fallback/Override

Wichtig:

- Keine Secrets committen.
- `twitch_user.json` nicht anzeigen und nicht committen.
- Nach Deploy Backend neu starten und mit `!vip @araglor` testen.

## Arbeitsregel fuer grosse Dateien

Wenn GitHub-/Tool-Ausgaben grosse Dateien gekuerzt liefern, stellt Forrest die echte Datei bereit. Dann wird auf Basis der echten Datei gearbeitet, nicht auf Basis geratener Patch-Scripte.


STEP031 Ergebnis:

- VIP-Settings werden in SQLite vorbereitet (`vip_sound_settings`).
- `helper_config.js` wird als Config-/Fallback-Layer genutzt.
- Lesereihenfolge fuer spaetere Dashboard-Werte: SQLite > Config > Default.
- Neue Routen: `/api/vip-sound/settings` und `/api/vip-sound/config`.
- Soundpfad-/Dateiregel-Verhalten bleibt in STEP031 unveraendert; Umstellung folgt in STEP032.


## STEP032 Ergebnis

- VIP-Soundpfad und Dateiregel werden jetzt aktiv aus `vip_sound_settings` gelesen.
- Aktive Settings: `enabled`, `soundBaseDir`, `fileNameMode`, `fileExtension`.
- Lesereihenfolge: SQLite -> Config-Fallback ueber `helper_config.js` -> Code-Default.
- Dashboard kann spaeter auf dieser Basis eine Settings-Oberflaeche bekommen.
