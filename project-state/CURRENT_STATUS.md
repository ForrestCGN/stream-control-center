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

Der aktuelle Stand nach STEP019 ist auf GitHub/dev dokumentiert.

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

## Repo/Live-Abgleich

Zuletzt fuer STEP019:

- GitHub/dev wurde geprueft.
- `backend/modules/vip_sound_overlay.js` enthaelt bereits VIP-Override-Logik.
- `htdocs/overlays/vip_sound_overlay_v2.html` ist im Repo vorhanden.
- Die mitgelieferten Statusdateien wurden nicht blind uebernommen, sondern in die bestehenden Projekt-Dokus eingearbeitet.
- Code wurde in STEP019 nicht geaendert.
- Live-Deploy und Live-Test stehen noch aus, weil das Live-System nur lokal bei Forrest sichtbar ist.

Live-Routen, die nach Deploy/Restart erneut geprueft werden sollen:

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
- project-state/STEP019_VIP_SOUND_OVERRIDE_2026-05-04.md

Aktueller Modulstand:

- backend/modules/vip_sound_overlay.js
- Version im Repo: 1.7.0

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
- VIP-Override: Mods/Broadcaster duerfen fuer Zieluser erneut ausloesen.
- Override-Rollen werden ueber `VIP_OVERRIDE_ALLOWED_ROLES` gesteuert.
- Standardrollen: `moderator,mod,broadcaster`.

Zuletzt bekannter Live-Test aus STEP017:

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

- Live-Deploy von STEP019-Doku/Repo-Stand pruefen.
- VIP-Override mit echten Streamer.bot-Rollen-/Badge-Parametern testen.
- Falls Streamer.bot andere Rollenfeldnamen liefert, nur Mapping in `vip_sound_overlay.js` erweitern.
- VIP-Soundpfad ueber DB/Dashboard konfigurierbar machen.
- VIP-Dashboard fuer Texte/Settings.
- Fireworks spaeter neu aufbauen.
- Dashboard-Modulstandard definieren.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
- tools/sync_streamassets_to_repo.ps1 spaeter pruefen.
