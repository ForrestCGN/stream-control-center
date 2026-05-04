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

## Aktueller Arbeitsstand

Der aktuelle Stand nach STEP023 ist auf GitHub/dev dokumentiert.

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

Aktueller Modulstand:

- backend/modules/vip_sound_overlay.js
- Version im Repo/Live: 1.7.1
- htdocs/overlays/vip_sound_overlay_v2.html ist die aktive OBS-VIP-Browserquelle.

Kernentscheidungen / aktueller Ablauf:

- Streamer.bot nimmt nur noch Befehle an und uebergibt Minimaldaten an Node.
- `!vip` nutzt Fetch URL zu `/api/vip-sound/command`.
- Streamer.bot sendet keinen VIP-Chattext mehr selbst.
- Streamer.bot startet kein VIP-Overlay mehr direkt.
- VIP-Command prueft Daily-Usage pro User/pro Stream-Tag.
- VIP-Command sucht Sounddatei unter `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`.
- Dateiregel aktuell: `Anzeigename.mp3`.
- Wenn Datei fehlt, wird keine Daily-Usage geschrieben.
- Wenn Datei existiert, wird `/api/sound/play` genutzt.
- Nur wenn das Sound-System akzeptiert, wird Daily-Usage geschrieben.
- Chat-Ausgabe erfolgt ueber helper_chat_output / Heimleitungs-Bot.
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


## STEP036 - Zentraler Settings-Helper

Vorbereitet wurde:

- `backend/modules/helpers/helper_settings.js`

Ziel:

- Dashboardfaehige Modul-Settings zentral ueber die Datenbank lesen/schreiben.
- JSON-Dateien bleiben Fallback-/Import-Schicht ueber `helper_config.js`.
- ENV/Secrets bleiben ausserhalb von DB und Repo.

Wichtig:

- `helper_config.js` wird nicht mit DB-Logik ueberladen.
- `helper_settings.js` nutzt `helper_config.js` fuer Datei-Fallbacks.
- Bestehende Funktionalitaet wurde nicht geaendert.
