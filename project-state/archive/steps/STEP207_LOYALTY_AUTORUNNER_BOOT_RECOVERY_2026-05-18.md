# STEP207 – Loyalty AutoRunner Boot Recovery

Datum: 2026-05-18

## Ziel

Der Loyalty AutoRunner soll nach einem Node-/Backend-Neustart automatisch wieder anlaufen, wenn der gespeicherte Stream-State weiterhin live ist.

## Hintergrund

Bei der Mehrtage-Auswertung fiel auf, dass der Stream-State am 17.05.2026 weiterhin live war, aber der Runner nach einem Node-Neustart nicht mehr weiterlief. Ursache: Der Stream-State liegt persistent in der Datenbank, der AutoRunner-Timer jedoch nur im Node-Prozessspeicher.

## Änderung

Betroffene Datei:

- `backend/modules/loyalty.js`

Umgesetzt:

- Version auf `0.1.10` erhöht.
- Neue Funktion `recoverAutoRunnerFromStoredStreamStateOnBoot()` ergänzt.
- Beim Modul-Init wird nach dem normalen Boot-Setup geprüft:
  - Ist der gespeicherte Stream-State effektiv live?
  - Ist `autoRunner.startOnStreamStateStart` aktiv?
  - Dann wird der AutoRunner mit Trigger `boot_recovery:stream_state_live` gestartet.
- Recovery wird in `loyalty_runner_events` geloggt:
  - `runner_auto_started_on_boot_live_state`
  - bei deaktiviertem Setting: `runner_boot_recovery_skipped_by_setting`
  - bei Lesefehler: `runner_boot_recovery_error`

## Bewusst nicht geändert

- Keine Änderung an Watch-Punkte-Logik.
- Keine Änderung an Event-Boni.
- Keine Änderung an Sub/Resub-Dedupe.
- Keine Änderung an GiftSub/GiftBomb-Verhalten.
- Keine DB-Schemaänderung.
- Kein automatischer Stop bei Twitch-API-Offline. `stopOnAutoOffline` bleibt unverändert.
- `enabledOnBoot` bleibt unverändert und wird nicht als Voraussetzung für Recovery verwendet.

## Test lokal im Paket

- `node --check backend/modules/loyalty.js` erfolgreich.

## Nach Deploy prüfen

1. Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 60
```

Erwartung:

- `version = 0.1.10`
- Bei offline Stream-State: Runner bleibt aus.

2. Simulierter Recovery-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/start?source=streamerbot&reason=step207_recovery_test" | ConvertTo-Json -Depth 60
```

Dann Node/Backend einmal neu starten.

Danach prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=20" | ConvertTo-Json -Depth 100
```

Erwartung:

- `timerActive = true`
- Trigger oder Event enthält `boot_recovery:stream_state_live`
- Event `runner_auto_started_on_boot_live_state` vorhanden

Danach Test sauber beenden:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/stop?source=streamerbot&reason=step207_recovery_test_stop" | ConvertTo-Json -Depth 60
```

## Nächster sinnvoller Schritt

Nach bestätigtem Recovery-Test: separater STEP für Sub/Resub-Dedupe, damit Resub-Events nicht zusätzlich als Subscribe gezählt werden, wenn beide Events für denselben User innerhalb weniger Sekunden eintreffen.
