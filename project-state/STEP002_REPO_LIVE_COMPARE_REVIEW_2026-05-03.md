# STEP002 Repo-vs-Live-Abgleich - Bewertung

Stand: 2026-05-03

## Ziel

Repo und Live-System wurden verglichen, damit keine Parallelstände entstehen.

## Ergebnis-Zahlen

Repo-Dateien: 189  
Live-Dateien: 8016  
Nur im Repo: 35  
Nur im Live-System: 7862  
Unterschiedliche Dateigröße: 2  

## Wichtigster Befund

Das Repo ist beim Hug-System weiter als das Live-System.

Nur im Repo vorhanden:

- backend/modules/hug_text_admin.js

Unterschiedliche Größe:

- htdocs/dashboard/modules/hug.js
- tools/sync_streamassets_to_repo.ps1

Das passt zu den letzten Commits:

- Add Hug text admin API
- Enable Hug text editing UI

## Bewertung

GitHub/dev enthält neue Hug-Textbearbeitungsfunktionalität, die im Live-System noch nicht vollständig angekommen ist.

Live läuft aktuell stabil, aber Live und Repo sind nicht synchron.

## Nicht blind übernehmen

Folgende Live-only Bereiche sind erwartbar oder sensibel und dürfen nicht blind ins Repo:

- _quarantine/*
- archive/*
- htdocs/assets/*
- htdocs/overlays/audio/*
- tools/piper/*
- config/google_tts_service_account.json
- config/tts_state.json
- data/*
- package-lock/package.json aus Live ohne Prüfung
- alte Root-Dateien wie restart_node_*.cmd/vbs ohne Entscheidung

## Kritische Live-only Docs

Im Live-System liegen Analyseberichte unter docs/*.txt:

- Backend_Systemuebersicht_2026-05-03.txt
- DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt
- ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt
- overlay_iststand_analyse.txt
- SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt

Diese sollten später geordnet in project-state/ oder docs/system-inspection/ übernommen werden, aber nicht ungeprüft doppelt verteilt bleiben.

## Nächster Schritt

Repo/dev sollte kontrolliert ins Live-System deployed werden, damit mindestens diese Repo-only Codeänderungen live ankommen:

- backend/modules/hug_text_admin.js
- htdocs/dashboard/modules/hug.js

Empfohlener Standardweg:

tools/easy/01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd

Danach erneuter Funktionstest:

- GET /api/_status
- GET /api/hug/db/status
- GET /api/dashboard/community/hug/status
- ggf. neue Hug-Text-Admin-Routen prüfen

