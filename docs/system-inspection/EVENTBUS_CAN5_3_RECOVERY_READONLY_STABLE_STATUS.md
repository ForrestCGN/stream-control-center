# EVENTBUS CAN-5.3 RECOVERY READ-ONLY STABLE STATUS

Stand: 2026-06-01
Status: stabiler Zwischenstand / Dokumentation

## Ergebnis

CAN-5.2 wurde live mit einem echten Test-Alert geprüft.

```text
Alert erfolgreich
Sound erfolgreich
Visual ACK erfolgreich
Recovery bleibt read-only
keine Automatik ausgelöst
```

## Bestätigter Live-Stand

```text
bus_diagnostics: 1.2.3
summary.status: ok
handshakeState: matched
correlationMatched: 2
correlationUnmatched: 0
warnings: []
errors: []
flowTouched: false
```

## Recovery-State

```text
recoveryStrategyMode: read_only
recoveryStrategyState: ok_no_recovery_needed
automationEnabled: false
allowedActions: none
blockedActions:
- auto_replay_alert
- auto_replay_sound
- auto_retry_overlay
- auto_recovery
reason: handshake_and_visual_acknowledged
```

## Bedeutung

Der Communication Bus kann jetzt den kompletten erfolgreichen Alert-Pfad inklusive Recovery-Entscheidung read-only sichtbar machen.

```text
Alert/Sound/Visual OK -> Recovery-State = ok_no_recovery_needed
Keine automatische Wiederholung
Keine automatische Recovery
Keine produktive Flow-Änderung
```

## Nicht geändert

```text
Keine Queue-Logik geändert
Keine Sound-Playback-Logik geändert
Keine Overlay-Ausgabe geändert
Keine TTS-Logik geändert
Keine automatische Recovery aktiviert
Keine DB-/Config-Migration
```

## Relevante Prüfbefehle

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status?check=1" | ConvertTo-Json -Depth 12
```

## Nächster sinnvoller Schritt

```text
CAN-5.4: Fehler-/Timeout-Simulation planen, weiterhin read-only
```

Ziel: kontrolliert prüfen, wie `missingAck`, `noClient`, `unmatched` oder `waiting_too_long` diagnostisch sichtbar werden, ohne produktive Wiederholungen auszulösen.
