# CURRENT_STATUS – stream-control-center

Stand: 2026-05-30

## Aktueller Gesamtstand

Das Projekt `stream-control-center` wird im Repo `ForrestCGN/stream-control-center` auf Branch `dev` gepflegt.

Aktive Basis:

```text
GitHub/dev: https://github.com/ForrestCGN/stream-control-center
Lokales Repo: D:\Git\stream-control-center
Live-System: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

GitHub/dev und die echten Projektdateien sind die Single Source of Truth. Wenn Live-/ZIP-Teststände neuer sein könnten, muss gezielt nach der echten Datei oder einer kurzen PowerShell-Ausgabe gefragt werden.

## Aktueller Fokus

Der große Project-State-/Dokumentations-Cleanup wurde abgeschlossen.

Aktueller abgeschlossener Doku-/Cleanup-Block:

```text
STEP553–STEP588 Project-State / Dokumentations-Cleanup
STEP589 General Project Prompt Update
STEP590 Central Status Docs Update
```

Ergebnis:

```text
project-state Root bereinigt
keine unerwarteten STEP-/NEXT_STEPS_STEP-Dateien im Root
relevante Archivgruppen geprüft
GENERAL_PROJECT_PROMPT.md auf neue Arbeitsweise aktualisiert
zentrale Statusdateien auf STEP588/589 nachgezogen
```

## Aktive Konsolidierungsdokumente

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

## Aktive Projektregeln

Wichtigste Einstiegspunkte für neue Chats und weitere Arbeiten:

```text
project-state/GENERAL_PROJECT_PROMPT.md
docs/current/PROJECT_WORKING_RULES.md
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
docs/modules/README.md
docs/modules/*.md
```

Verbindlich:

```text
keine Funktionalität entfernen
keine Patches / keine Teil-Datei-Workarounds
vollständige echte Dateien als Basis nutzen
ZIPs mit echten Zielpfaden ab Repo-Root bauen
fehlende Dateien konkret anfordern
Routen nicht aus Erinnerung annehmen
PowerShell-/API-Ausgaben kurz und feldgenau halten
Dashboard nutzt Backend-APIs, nicht direkt DB/Dateien
SQLite niemals ersetzen/überschreiben/neu bauen
MariaDB/MySQL nur geplant und adapterbasiert vorbereiten
EventBus nur ergänzend, nicht ungeprüft produktive Flows ersetzen
```

## Aktueller gültiger Modulstand

Channelpoints:

```text
STEP527_CHANNELPOINTS_CREATE_SAVE_TWITCH_INACTIVE_DEFAULT_v0.9.13
```

Sound-System Config/Routing:

```text
STEP523_SOUND_SYSTEM_AUTO_OUTPUT_DEFAULTS_FIX_v0.1.12
```

Media-Dateinamen:

```text
STEP524_MEDIA_ASSET_UTF8_FILENAME_CLEANUP_REAL_v0.1.0
```

## Nicht verwenden / zurückgezogen

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11
STEP526_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_HOTFIX_v0.9.12
```

STEP526 wurde durch STEP527 ersetzt.

## Channelpoints – aktuelles Bedienkonzept

Editor:

```text
kein normales lokales Aktiv-Häkchen
Speichern legt lokal an oder ändert lokal
Speichern erstellt/aktualisiert den Twitch-Reward
neuer Twitch-Reward wird standardmäßig NICHT aktiv/sichtbar auf Twitch erstellt
```

Übersicht:

```text
Twitch Aktiv/Inaktiv-Schalter
betrifft nur Twitch sichtbar/einlösbar
Aktiv = Twitch Reward aktivieren
Inaktiv = Twitch Reward deaktivieren
```

Bestehender Reward:

```text
Bearbeiten + Speichern aktualisiert lokal und Twitch
bisheriger Twitch-Aktivstatus bleibt erhalten
```

Intern darf `system_enabled` als technische Kompatibilitätsspalte weiter existieren, soll aber nicht als normale Dashboard-Bedienlogik sichtbar sein.

## Wichtige offene Tests

Nach Deploy/Backend-Neustart weiter prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/_status"
$s.modules | Select-Object name,loaded,version,lastError | Format-Table -AutoSize
```

Channelpoints:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

Twitch-Manage:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/manage/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

Sound:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

## Nächster sinnvoller Block

```text
STEP591 – Routes and Module Docs Verification Scan
```

Ziel:

```text
echte Backend-Routen aus Modulen prüfen
Dashboard-/Overlay-/Streamer.bot-relevante APIs markieren
gegen docs/modules/*.md und docs/current/CURRENT_SYSTEM_STATUS.md vergleichen
fehlende/veraltete Routen-Doku melden
```

Danach kann auf Basis echter Routenlage gezielt Modul-Doku aktualisiert werden.

<!-- STEP612_ROUTE_MODULE_DOCS_COMPLETION_STATUS_START -->
## STEP612 Route-/Modul-Doku-Konsolidierung abgeschlossen

Stand: 2026-05-30

Die Route-/Modul-Doku-Konsolidierung aus STEP591 bis STEP611D ist abgeschlossen und final verifiziert.

Abschlusspruefung:

- Completion OK: True
- Docs checked: 7
- Report groups checked: 24
- STEP610 remaining all batches: 0
- Warnings/Errors in STEP611D: 0/0

Wichtig:

- Es wurden keine produktiven Flows umgebaut.
- Die Arbeiten waren Doku-/Scan-/Konsolidierungsarbeit.
- Zentrale Zielbereiche wurden ergaenzt: ROUTES, Current Status, Channelpoints, Sound Routing, Dashboard Commands, Communication Bus, Shoutout System.
- STEP611A bis STEP611D klaerten und korrigierten nur zu strenge Verification-/Marker-Mappings.
<!-- STEP612_ROUTE_MODULE_DOCS_COMPLETION_STATUS_END -->

<!-- STEP615_CLEANUP_FREEZE_START -->
## STEP615 Cleanup Freeze & Return to Productive Work

Stand: 2026-05-30

Die Cleanup-/Doku-Konsolidierungsrunde ist eingefroren. Route-/Modul-Doku STEP591 bis STEP613 ist abgeschlossen und STEP614 hat eine Uebergabe plus Fresh-SystemScan-Prep erstellt.

Frischer Scan als Referenz:

- Files: 1122
- Backend modules: 69
- Helpers: 18
- Dashboard files: 67
- Overlay files: 34
- Config files: 58
- Docs files: 250
- Cleanup candidates: 550

Entscheidung: Cleanup-Kandidaten werden nicht weiter kleinteilig verfolgt. Weitere Cleanup-Arbeit nur noch bei echtem Bedarf und dann als groesserer, sicher geplanter Batch.
<!-- STEP615_CLEANUP_FREEZE_END -->

