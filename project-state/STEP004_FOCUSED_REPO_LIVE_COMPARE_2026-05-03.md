# STEP004 - Fokussierter Repo-vs-Live-Abgleich

Stand: 2026-05-03

## Ziel

Nach STEP001 bis STEP003 wurde ein fokussierter Abgleich zwischen GitHub-Repo und Live-System durchgeführt.

Es wurden nur relevante Bereiche betrachtet:

- backend
- config
- htdocs/dashboard
- htdocs/overlays
- docs
- project-state
- tools/easy
- Deploy-/Sync-Skripte

Ausgeschlossen wurden bewusst:

- node_modules
- .git
- archive
- _quarantine
- secrets
- data
- htdocs/assets
- htdocs/overlays/audio
- htdocs/overlays/assets
- tools/piper
- tools/ffmpeg
- tools/audio-device-helper/dist
- config_BACKUP_*
- .env
- google_tts_service_account.json
- SQLite/WAL/SHM
- Backup-/Altdateien

## Ergebnis-Zahlen

Repo relevant: 186  
Live relevant: 156  
Nur Repo: 36  
Nur Live: 6  
Unterschiedliche Größe: 1  

## Bewertung Nur Live

Nur im Live-System vorhanden:

- config/tts_state.json
- docs/Backend_Systemuebersicht_2026-05-03.txt
- docs/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt
- docs/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt
- docs/overlay_iststand_analyse.txt
- docs/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt

Bewertung:

- config/tts_state.json ist Runtime-State und wird nicht ins Repo übernommen.
- Die docs/*.txt Dateien sind alte Analyse-/Übergabedateien im Live-System.
- Der wichtige Master-TODO liegt bereits sauber unter project-state/ im Repo.
- Die übrigen Analyseberichte können später geordnet nach docs/system-inspection/ übernommen werden, aber nicht ungeprüft doppelt verteilt bleiben.

## Bewertung Nur Repo

Nur im Repo vorhanden sind überwiegend:

- docs/_generated/*
- docs/admin/*
- docs/auth/*
- docs/settings/*
- docs/sound_system/*
- docs/user/*
- project-state/*
- tools/easy/*
- tools/deploy_repo_to_streamassets.ps1
- tools/upload_streamassets_changes.ps1

Bewertung:

- Diese Dateien sind Projekt-/Doku-/Workflow-Dateien.
- Sie müssen nicht zwingend im Live-System produktiv ausgeliefert werden.
- GitHub/dev bleibt dafür die Dokumentations- und Workflow-Wahrheit.

## Unterschiedliche Größe

- tools/sync_streamassets_to_repo.ps1
  - Repo: 3512 Bytes
  - Live: 3270 Bytes

Bewertung:

- Das ist ein Tool-/Workflow-Skript, kein produktives Backend-/Dashboard-/Overlay-Modul.
- Repo gilt als aktuellere Quelle.
- Kein Sofort-Fix nötig, aber bei späterer Tool-Bereinigung prüfen.

## Fazit

Produktive Kernbereiche sind nach STEP003 sauber:

- Backend keine relevante Abweichung
- Dashboard keine relevante Abweichung
- Overlays keine relevante Abweichung
- Config keine kritische Abweichung außer bewusst ausgeschlossener Runtime-State
- Hug-Admin-Reste entfernt
- Live läuft stabil

## Nächster sinnvoller Schritt

Jetzt kann mit echten Vereinheitlichungen begonnen werden.

Empfohlene Reihenfolge:

1. Kleine technische API-Angleichung: OBS /api/obs/* Aliase ergänzen, Legacy /obs/* behalten.
2. Danach Fireworks-Doppelroute prüfen und sauber zentralisieren.
3. Danach Dashboard-Encoding/Mojibake in sound.js/adminconfigs.js beheben.
4. Danach Dashboard-Modulstandard definieren.

Keine große Funktionsänderung ohne neuen STEP und Tests.

