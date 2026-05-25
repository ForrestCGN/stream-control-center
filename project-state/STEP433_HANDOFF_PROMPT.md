# STEP433 Handoff Prompt – stream-control-center / VIP Bus-Modus

Kopiere diesen Prompt in einen neuen Chat, um direkt mit STEP433 weiterzumachen.

---

Wir arbeiten am Projekt `stream-control-center` / Kommunikations-System für ForrestCGN.

## Feste Arbeitsregeln
- Bitte auf Deutsch antworten.
- Keine Patches, keine Git-Patches, keine PowerShell-Regex- oder Inline-Patch-Scripte.
- Änderungen nur als vollständige Ersatzdateien mit echten Zielpfaden im ZIP liefern.
- ZIPs müssen direkt nach `D:\Git\stream-control-center` entpackbar sein.
- Nach ZIP immer kurze Test-/Commit-Anweisung liefern:
  ```cmd
  cd D:\Git\stream-control-center
  node --check ...
  .\stepdone.cmd "..."
  ```
- Keine Funktionalität entfernen.
- Alte produktive Systeme bleiben, bis bewusst migriert.
- SQLite `D:\Streaming\stramAssets\data\sqlite\app.sqlite` niemals ersetzen/überschreiben; DB nur additiv.
- Dashboard soll über Backend-APIs arbeiten, nicht direkt auf DB/Dateien.
- Runtime-Dateien/API-Status sollen Versionen/Capabilities enthalten, keine STEP-Nummern als Runtime-Status.

## Projektpfade
- Repo: `https://github.com/ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Live-System: `D:\Streaming\stramAssets`
- Relevante Dateien:
  - `backend/modules/vip_sound_overlay.js`
  - `backend/modules/sound_system.js`
  - `backend/modules/bus_diagnostics.js`
  - `backend/modules/communication_bus.js`
  - `backend/modules/helpers/helper_communication.js`
  - `htdocs/dashboard/modules/bus_diagnostics.js`
  - `htdocs/dashboard/modules/bus_diagnostics.css`
  - `docs/current/CURRENT_SYSTEM_STATUS.md`
  - `project-state/CURRENT_STATUS.md`
  - `project-state/CHANGELOG.md`
  - `project-state/FILES.md`
  - `project-state/NEXT_STEPS.md`

## Aktueller Stand bis STEP432

### Sound-System
Aktueller Stand aus STEP430:
- Datei: `backend/modules/sound_system.js`
- Version: `0.1.17`
- Feature: `sound_bus_command_play_test_layer`
- Capabilities:
  - `sound.event_output`
  - `sound.command_input`
- Routen:
  - `/api/sound/eventbus/status`
  - `/api/sound/eventbus/test`
  - `/api/sound/eventbus/reset`
  - `/api/sound/eventbus/command/status`
  - `/api/sound/eventbus/command/test`
  - `/api/sound/eventbus/command/dry-run`
  - `/api/sound/eventbus/command/play-test`
  - `/api/sound/eventbus/command/reset`
- Dry-Run funktioniert: validiert `sound.play.request`, ohne Queue/Audio zu berühren.
- Play-Test funktioniert: explizite Route kann einen Command-förmigen Sound-Request wirklich starten.
- Produktiv bleibt weiterhin `/api/sound/play`.

### VIP Sound Overlay
Aktueller Stand aus STEP432:
- Datei: `backend/modules/vip_sound_overlay.js`
- Version: `1.8.15`
- Feature: `vip_sound_bus_mode_preparation`
- Vorbereitete Modi:
  - `legacy`
  - `shadow`
  - `play_test`
  - `bus_enabled`
- Neue Route:
  - `/api/vip-sound/eventbus/sound-command/mode`
- Alias:
  - `/api/vip-sound-overlay/eventbus/sound-command/mode`
- Bestehende Routen:
  - `/api/vip-sound/eventbus/sound-command/status`
  - `/api/vip-sound/eventbus/sound-command/test`
  - `/api/vip-sound/eventbus/sound-command/dry-run`
  - `/api/vip-sound/eventbus/sound-command/play-test`
  - `/api/vip-sound/eventbus/sound-command/reset`

## Wichtiger STEP432-Testbefund
Folgender Test wurde ausgeführt:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/mode" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/mode?mode=shadow" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
```

Ergebnis:
- Mode-Route ohne Parameter zeigt korrekt `mode: legacy`.
- `mode?mode=shadow` nimmt `shadow` korrekt an und antwortet mit:
  - `mode: shadow`
  - `vipBusMode: shadow`
  - `effectiveVipFlow: legacy_sound_system_api`
  - `productiveEntryPointChanged: false`
  - `queueTouched: false`
  - `audioTouched: false`
  - `dailyUsageTouched: false`
- Danach zeigt `/status` aber wieder:
  - `vipBusMode: legacy`
  - `effectiveVipFlow: legacy_sound_system_api`
- Gleichzeitig steht in `recentCommands`, dass `vip.bus_mode.set` auf `shadow` ausgeführt wurde.

Interpretation:
- STEP432 ist als Vorbereitung bestanden.
- Der Runtime-Modus wird noch nicht sauber dauerhaft im Status gehalten.
- STEP433 soll genau diese Status-/Runtime-Persistenz korrigieren.

## Ziel für STEP433
Bitte erstelle STEP433 als vollständige Ersatzdatei-ZIP.

Titel:
`STEP433 – VIP Bus-Modus Status/Persistenz sauberziehen`

Ziel:
- `mode?mode=shadow` soll den Modus sauber im Runtime-State halten.
- Direkt danach muss `/api/vip-sound/eventbus/sound-command/status` ebenfalls `vipBusMode: shadow` zeigen.
- Der Modus soll mindestens bis Reset/Server-Neustart stabil im Runtime-State bleiben.
- Optional sinnvoll: `reset` setzt wieder auf Default `legacy`, aber bitte klar dokumentieren.
- Keine echte produktive Umschaltung auf Bus in STEP433.
- `effectiveVipFlow` bleibt in STEP433 weiterhin `legacy_sound_system_api`, auch wenn `vipBusMode` `shadow` oder `play_test` ist.
- `bus_enabled` bleibt nur vorbereitet, nicht produktiv aktiv.

## Erwartete Tests nach STEP433

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/mode?mode=shadow" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/mode?mode=play_test" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
```

Erwartung:
```text
version: 1.8.16
feature: vip_sound_bus_mode_runtime_status
allowedVipBusModes: legacy, shadow, play_test, bus_enabled
mode?mode=shadow -> vipBusMode: shadow
status danach -> vipBusMode: shadow
mode?mode=play_test -> vipBusMode: play_test
status danach -> vipBusMode: play_test
effectiveVipFlow: legacy_sound_system_api
productiveEntryPointChanged: false
queueTouched: false
audioTouched: false
dailyUsageTouched: false
```

## Danach erst weiterdenken
Nach STEP433 kann in STEP434 geprüft werden, ob der echte VIP-Command je nach Modus zusätzlich Shadow/Dry-Run/Play-Test ausführt. Aber noch nicht in STEP433.
