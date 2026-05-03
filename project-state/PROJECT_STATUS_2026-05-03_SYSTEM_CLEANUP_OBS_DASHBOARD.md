# Projektstand 2026-05-03 - System-Cleanup, OBS-API, Dashboard-Fixes

Stand: 2026-05-03  
Repo: D:\Git\stream-control-center  
Live: D:\Streaming\stramAssets  
Branch: dev  
GitHub: https://github.com/ForrestCGN/stream-control-center

## Ziel dieses Arbeitsblocks

Das System wurde aufgeräumt, Repo und Live wurden abgeglichen und mehrere kleine, risikoarme Vereinheitlichungen wurden abgeschlossen.

Wichtig:
- Keine Funktionalität entfernt.
- Keine unfertigen Hug-Admin-Änderungen übernommen.
- GitHub/dev und Live wurden bewusst synchron gehalten.
- Jeder abgeschlossene Schritt wurde dokumentiert.

---

## Abgeschlossene Schritte

### STEP001 - Live Backup-/Altdateien archiviert

Produktive Live-Ordner wurden von alten Backup-/Altdateien bereinigt.

Betroffene Live-Pfade:

- D:\Streaming\stramAssets\backend\modules
- D:\Streaming\stramAssets\htdocs\dashboard
- D:\Streaming\stramAssets\htdocs\overlays

Ergebnis:

- 42 alte Backup-/Altdateien verschoben.
- Nichts gelöscht.
- Archiv:
  - D:\Streaming\stramAssets\archive\system_cleanup_step001\
- Manifest:
  - D:\Streaming\stramAssets\archive\system_cleanup_step001\MANIFEST_system_cleanup_step001.csv

---

### STEP002 - Repo-vs-Live-Abgleich

Repo und Live wurden verglichen.

Wichtiger Befund:

- Unfertige Hug-Text-Admin-Arbeiten aus einem vorherigen Chat waren im Repo vorhanden.
- Live lief bereits korrekt.
- Diese unfertigen Änderungen wurden nicht nach Live übernommen.

Bereinigung danach:

- backend/modules/hug_text_admin.js wurde aus dem Repo entfernt.
- htdocs/dashboard/modules/hug.js wurde aus dem funktionierenden Live-Stand zurück ins Repo übernommen.

---

### STEP003 - Repo nach Live synchronisiert / Hug sauber gehalten

Nach der Hug-Bereinigung wurde GitHub/dev kontrolliert nach Live synchronisiert.

Geprüft:

- GET /api/_status
- GET /api/hug/db/status
- GET /api/dashboard/community/hug/status

Zusätzlich geprüft:

- backend/modules/hug_text_admin.js existiert live nicht.
- Dashboard-Hug enthält keine Aufrufe auf /api/hug/admin/texts.

Ergebnis:

- Hug-System bleibt auf funktionierendem Stand.
- Kein unfertiger Hug-Admin-Texteditor aktiv.

---

### STEP004 - Fokussierter Repo-vs-Live-Abgleich

Nach STEP001 bis STEP003 wurde ein fokussierter Abgleich durchgeführt.

Geprüfte Bereiche:

- backend
- config
- htdocs/dashboard
- htdocs/overlays
- docs
- project-state
- tools/easy
- Deploy-/Sync-Skripte

Bewertung:

- Keine kritische Backend-/Dashboard-/Overlay-Abweichung.
- config/tts_state.json bleibt Runtime-State und wird nicht ins Repo übernommen.
- Live-only docs/*.txt bleiben vorerst nur dokumentiert.
- tools/sync_streamassets_to_repo.ps1 hatte Größenabweichung, aber kein Produktivmodul.

---

### STEP005 - OBS API-Aliase ergänzt

In backend/modules/obs.js wurden Aliase ergänzt.

Vorher:

- /obs/*

Zusätzlich jetzt:

- /api/obs/*

Technik:

- Helper obsRoutes(legacyPath) ergänzt.
- Routen werden gleichzeitig unter legacyPath und /api + legacyPath registriert.

Wichtig:

- Keine bestehende /obs/* Route entfernt.
- Handlerlogik nicht geändert.
- Rückwärtskompatibilität bleibt erhalten.

Erfolgreich getestet:

- GET /obs/health
- GET /api/obs/health
- GET /obs/status
- GET /api/obs/status
- GET /obs/scenes
- GET /api/obs/scenes

---

### STEP006 - OBS Dashboard nutzt /api/obs/* für Leserouten

In htdocs/dashboard/modules/obs.js wurden sichere Leserouten umgestellt.

Geändert:

- /obs/dashboard/config -> /api/obs/dashboard/config
- /obs/status -> /api/obs/status
- /obs/scenes -> /api/obs/scenes
- /obs/replay/status -> /api/obs/replay/status
- /obs/audio/state -> /api/obs/audio/state
- /obs/stats -> /api/obs/stats
- /obs/browser-sources -> /api/obs/browser-sources
- /obs/sources -> /api/obs/sources

Bewusst zunächst nicht geändert:

- /obs/scene/switch
- /obs/replay/save

Tests:

- GET /api/obs/status
- GET /api/obs/scenes
- GET /api/obs/replay/status
- GET /api/obs/audio/state

---

### STEP007 - Dashboard Mojibake repariert

Sichtbare Encoding-/Mojibake-Fehler wurden repariert.

Betroffene Dateien:

- htdocs/dashboard/modules/adminconfigs.js
- htdocs/dashboard/modules/sound.js

Repariert wurden u. a.:

- fÃ¼r -> für
- GerÃ¤t -> Gerät
- PrioritÃ¤t -> Priorität
- Ã„nderungen -> Änderungen
- Â· -> ·
- â€” -> —

Wichtig:

- Nur sichtbare Texte korrigiert.
- Keine Logik geändert.
- Keine Funktion entfernt.

Live-Prüfung:

- Keine Treffer mehr für Mojibake-Muster in beiden Live-Dateien.

---

### STEP008 - Fireworks-Doppelroute geprüft

Befund:

Fireworks-Routen sind doppelt registriert:

In backend/server.js:

- GET /api/fireworks
- GET /api/fireworks/stop
- GET /api/fireworks/clear

In backend/modules/fireworks_api.js:

- GET /api/fireworks
- GET /api/fireworks/stop
- GET /api/fireworks/clear

Entscheidung:

- Keine Codeänderung.
- Fireworks wird später ohnehin neu aufgebaut.
- Doppelroute nur dokumentiert.

Offen für später:

- Fireworks vollständig in eigenes Modul verschieben.
- server.js von Fireworks-Spezialrouten befreien.
- Einheitliches /api/fireworks/* System definieren.
- WebSocket-Broadcast zentralisieren.

---

### STEP010 - OBS Dashboard nutzt /api/obs/* für Aktionen

In htdocs/dashboard/modules/obs.js wurden auch die OBS-Dashboard-Aktionen umgestellt.

Geändert:

- /obs/scene/switch -> /api/obs/scene/switch
- /obs/replay/save -> /api/obs/replay/save

Wichtig:

- Backend-Logik nicht geändert.
- Legacy /obs/* bleibt weiter vorhanden.
- Dashboard nutzt für OBS-Lesen und OBS-Aktionen jetzt /api/obs/*.

Tests:

- node -c htdocs/dashboard/modules/obs.js
- Suche nach alten Dashboard-POST-Routen
- Suche nach Mojibake-Mustern
- Live-Datei nach Deploy geprüft
- GET /api/obs/status geprüft

---

## Heute geänderte/berührte Hauptdateien

Code:

- backend/modules/obs.js
- htdocs/dashboard/modules/obs.js
- htdocs/dashboard/modules/sound.js
- htdocs/dashboard/modules/adminconfigs.js

Dokumentation:

- project-state/STEP002_REPO_LIVE_COMPARE_REVIEW_2026-05-03.md
- project-state/STEP003_DEPLOY_REPO_TO_LIVE_HUG_CLEAN_2026-05-03.md
- project-state/STEP004_FOCUSED_REPO_LIVE_COMPARE_2026-05-03.md
- project-state/STEP005_OBS_API_ALIASES_2026-05-03.md
- project-state/STEP006_OBS_DASHBOARD_API_READS_2026-05-03.md
- project-state/STEP007_DASHBOARD_MOJIBAKE_FIX_2026-05-03.md
- project-state/STEP008_FIREWORKS_DUPLICATE_ROUTES_REVIEW_2026-05-03.md
- project-state/STEP010_OBS_DASHBOARD_API_ACTIONS_2026-05-03.md
- project-state/STEP007_mojibake_findings_before.txt

---

## Abschlussprüfung

Repo/Live Hash-Abgleich für geänderte Dateien:

- backend/modules/obs.js -> Same=True
- htdocs/dashboard/modules/obs.js -> Same=True
- htdocs/dashboard/modules/sound.js -> Same=True
- htdocs/dashboard/modules/adminconfigs.js -> Same=True

Live-Routen geprüft:

- GET /api/_status -> ok
- GET /api/obs/status -> ok
- GET /api/obs/scenes -> ok
- GET /api/sound/status -> ok

Mojibake-Livecheck:

- adminconfigs.js -> keine Treffer
- sound.js -> keine Treffer

Git-Status am Ende:

- working tree clean
- dev ist up to date mit origin/dev

---

## Bewusst offen

### Fireworks

Nicht umbauen, weil später Neuaufbau geplant.

### Hug-Textbearbeitung

Nicht aktiv.
Unfertige Hug-Admin-Arbeiten wurden entfernt.
Eine spätere Textbearbeitung muss neu geplant werden mit:

- vorhandenen Helpern
- Rechte-/Rollenprüfung
- Audit-Logging
- sauberem STEP
- keine Parallelmodule

### OBS Legacy-Routen

/obs/* bleibt bewusst bestehen.
Dashboard nutzt jetzt /api/obs/*.
Streamer.bot/alte Links können weiterhin /obs/* nutzen.

### tools/sync_streamassets_to_repo.ps1

War in STEP004 unterschiedlich zwischen Repo und Live.
Nicht produktiv kritisch.
Später bei Tool-Bereinigung prüfen.

---

## Nächste sinnvolle Schritte

Empfohlene Reihenfolge:

1. Kurzer erneuter Repo/Live-Abgleich, falls ein neuer Arbeitstag/Chat beginnt.
2. Dashboard-Modulstandard definieren:
   - init/loadAll/render/bindActions Struktur
   - API-Prefix-Strategie
   - Error-/Loading-/Empty-State
   - Config-Lesen/-Schreiben
3. Danach ein Modul als Referenz sauber machen.
4. Später Fireworks neu aufbauen.
5. Später Hug-Textbearbeitung neu planen, nicht alte unfertige Version wiederbeleben.

---

## Arbeitsregel ab jetzt

Vor jedem weiteren STEP:

1. git status prüfen.
2. GitHub/dev und Live bewusst abgleichen.
3. Nur reale Dateien als Wahrheit nutzen.
4. Keine unfertigen Chat-Reste übernehmen.
5. Keine Funktionalität entfernen.
6. Nach Änderung:
   - testen
   - deployen
   - live prüfen
   - STEP-Doku schreiben
   - git status clean herstellen

