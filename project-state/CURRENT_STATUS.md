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

Der aktuelle Stand nach STEP011 ist sauber dokumentiert.

Zuletzt abgeschlossen:

- STEP005 OBS API-Aliase /api/obs/*
- STEP006 OBS Dashboard Leserouten auf /api/obs/*
- STEP007 Mojibake in sound/adminconfigs repariert
- STEP008 Fireworks-Doppelroute dokumentiert, kein Umbau
- STEP010 OBS Dashboard Aktionen auf /api/obs/*
- STEP011 Doku-Struktur in Repo und Live eingeführt

## Repo/Live-Abgleich

Zuletzt geprüft:

- backend/modules/obs.js Same=True
- htdocs/dashboard/modules/obs.js Same=True
- htdocs/dashboard/modules/sound.js Same=True
- htdocs/dashboard/modules/adminconfigs.js Same=True
- docs/current/CURRENT_SYSTEM_STATUS.md Same=True

Live-Routen geprüft:

- GET /api/_status
- GET /api/obs/status
- GET /api/obs/scenes
- GET /api/sound/status

Alle Prüfungen waren erfolgreich.

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

- Keine Funktionalität entfernen.
- Vor Änderungen echten Dateistand prüfen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Keine Backups/Altdateien committen.
- Historische Analyse-Snapshots nicht überschreiben.
- Aktuellen Stand in docs/current/CURRENT_SYSTEM_STATUS.md und project-state aktuell halten.
- Nach jedem abgeschlossenen Block STEP-Doku schreiben.

## Bewusst offen

- Fireworks später neu aufbauen.
- Dashboard-Modulstandard definieren.
- Hug-Textbearbeitung später sauber neu planen.
- Alerts-Modul später behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
- tools/sync_streamassets_to_repo.ps1 später prüfen.
