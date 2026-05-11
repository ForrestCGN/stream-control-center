# STEP011 - Dokumentationsstruktur eingeführt

Stand: 2026-05-03

## Ziel

Eine klare Doku-Struktur schaffen, damit es nicht wieder mehrere unklare Projektstände gibt.

## Ergebnis

Doku liegt jetzt geordnet in Repo und Live.

Repo:

- D:\Git\stream-control-center\docs

Live:

- D:\Streaming\stramAssets\docs

Aktueller Einstiegspunkt:

- docs/current/CURRENT_SYSTEM_STATUS.md

## Struktur

- docs/backend/
- docs/current/
- docs/dashboard/
- docs/database/
- docs/overlays/
- docs/system-inspection/2026-05-03/

## Übernommene Analyse-Snapshots

- docs/backend/Backend_Systemuebersicht_2026-05-03.txt
- docs/dashboard/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt
- docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt
- docs/overlays/overlay_iststand_analyse.txt
- docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt

## Live-Aufräumung

Die fünf losen Analyse-Dateien im Live-docs-Root wurden nicht gelöscht, sondern archiviert.

Archiv:

- D:\Streaming\stramAssets\archive\docs_root_cleanup_step011\

Manifest:

- D:\Streaming\stramAssets\archive\docs_root_cleanup_step011\MANIFEST_docs_root_cleanup_step011.csv

## Prüfung

Geprüft:

- docs/current/CURRENT_SYSTEM_STATUS.md ist in Repo und Live identisch.
- SHA256-Vergleich: Same=True
- D:\Streaming\stramAssets\docs enthält im Root keine losen Analyse-Dateien mehr.
- Live-Dokus liegen in den passenden Unterordnern.

## Regel ab jetzt

- Historische Analyse-Snapshots nicht überschreiben.
- Aktuellen Arbeitsstand in docs/current/CURRENT_SYSTEM_STATUS.md pflegen.
- STEP-Dokus weiter unter project-state/ ablegen.
- Keine Dokus nach htdocs kopieren.
- Keine Secrets oder Datenbanken in docs committen.
