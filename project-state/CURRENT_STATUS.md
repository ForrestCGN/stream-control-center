# CURRENT STATUS - stream-control-center

Stand: 2026-05-03

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

Der aktuelle Stand nach STEP017 ist dokumentiert und live getestet.

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

## Repo/Live-Abgleich

Zuletzt fuer STEP017:

- Repo/dev sauber
- origin/dev auf gleichem Stand
- Live deployed
- Backend neu gestartet
- Live-Test erfolgreich

Live-Routen geprueft:

- GET /api/_status
- GET /api/sound/status
- GET /api/vip-sound/status
- GET /api/vip-sound/db/status
- GET /api/vip-sound/command
- GET /api/vip-sound-overlay/state

## VIP-/Sound-/Overlay-Stand

Dokumentiert in:

- project-state/STEP015_VIP_SOUND_OVERLAY_PLAN_2026-05-03.md
- project-state/STEP017_VIP_SOUND_SYSTEM_QUEUE_2026-05-03.md

Aktueller Modulstand:

- backend/modules/vip_sound_overlay.js
- Version: 1.7.0

Kernentscheidungen / aktueller Ablauf:

- Streamer.bot nimmt nur noch Befehle an und uebergibt Minimaldaten an Node.
- VIP-Command prueft Daily-Usage pro User/pro Stream-Tag.
- VIP-Command sucht Sounddatei unter `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`.
- Dateiregel aktuell: `Anzeigename.mp3`.
- Wenn Datei fehlt, wird keine Daily-Usage geschrieben.
- Wenn Datei existiert, wird `/api/sound/play` genutzt.
- Nur wenn das Sound-System akzeptiert, wird Daily-Usage geschrieben.
- Chat-Ausgabe erfolgt ueber helper_chat_output / Heimleitungs-Bot.
- Streamer.bot soll `chatMessage` nicht mehr selbst posten.
- Response fuer Streamer.bot: `send=false`, `streamerbot_send="0"`, `chatMessage=""`.
- VIP-Einblendung erscheint noch nicht ueber den neuen Sound-System-Start; das bleibt offen fuer STEP018.

Live-Test:

- `araglor` wurde erfolgreich mit `vip/araglor.mp3` ueber Sound-System/AudioDeviceHelper abgespielt.
- Duplicate-Test fuer `araglor` blockte korrekt ohne Sound-System-Request.
- `vip_sound_daily_usage` enthaelt `araglor` genau einmal fuer `2026-05-03`.

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

- STEP018: VIP-Overlay erst bei echtem Sound-System-Start anzeigen.
- `soundSystemRequestId` sauber aus `/api/sound/play` Response uebernehmen.
- VIP-Soundpfad ueber DB/Dashboard konfigurierbar machen.
- VIP-Dashboard fuer Texte/Settings.
- Fireworks spaeter neu aufbauen.
- Dashboard-Modulstandard definieren.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
- tools/sync_streamassets_to_repo.ps1 spaeter pruefen.
