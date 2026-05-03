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

Der aktuelle Stand nach STEP015 ist dokumentiert.

Zuletzt abgeschlossen:

- STEP005 OBS API-Aliase /api/obs/*
- STEP006 OBS Dashboard Leserouten auf /api/obs/*
- STEP007 Mojibake in sound/adminconfigs repariert
- STEP008 Fireworks-Doppelroute dokumentiert, kein Umbau
- STEP010 OBS Dashboard Aktionen auf /api/obs/*
- STEP011 Doku-Struktur in Repo und Live eingefuehrt
- STEP015 VIP-/Sound-/Overlay-Planung dokumentiert

## Repo/Live-Abgleich

Zuletzt fuer STEP015 geprueft:

- backend/modules/sound_system.js Same=True
- backend/modules/vip_sound_overlay.js Same=True
- backend/modules/helpers/helper_messages.js Same=True
- backend/modules/helpers/helper_texts.js Same=True
- backend/modules/helpers/helper_chat_output.js Same=True
- config/sound_system.json Same=True

Live-Routen geprueft:

- GET /api/_status
- GET /api/sound/status
- GET /api/vip-sound/status
- GET /api/vip-sound-overlay/state

Alle Pruefungen waren erfolgreich.

## VIP-/Sound-/Overlay-Zielstand

Dokumentiert in:

- project-state/STEP015_VIP_SOUND_OVERLAY_PLAN_2026-05-03.md

Kernentscheidungen:

- Streamer.bot nimmt kuenftig nur noch Befehle an und uebergibt Minimaldaten an Node.
- Node/VIP-Modul prueft Daily-Usage pro User/pro Stream-Tag.
- VIP-Nachrichten werden als mehrere Heimleitungs-Zufallstexte pro Event-Key in SQLite gespeichert.
- VIP-Soundpfad wird konfigurierbar, aktueller Pfad: D:\Streaming\stramAssets\htdocs\assets\sounds\vip\
- Dateiregel aktuell: Anzeigename.mp3
- Sound-System verwaltet Prioritaet und Queue.
- VIP-Einblendung erscheint erst beim echten Soundstart, nicht beim Enqueue.
- Keine Queue-Position mehr in VIP-Chatnachrichten.

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

- STEP016 VIP-Minimalroute mit Daily-Usage und DB-Message-Templates.
- Sound-System-Kopplung fuer VIP-Soundstart.
- VIP-Overlay-Synchronisierung mit echtem Soundstart.
- VIP-Dashboard fuer Texte/Settings.
- Fireworks spaeter neu aufbauen.
- Dashboard-Modulstandard definieren.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
- tools/sync_streamassets_to_repo.ps1 spaeter pruefen.
