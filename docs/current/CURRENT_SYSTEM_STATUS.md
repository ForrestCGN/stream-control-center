# CURRENT SYSTEM STATUS

Aktueller Stand: STEP453 – Alert Bus Safe Parallel Integration.

## Runtime-Stand

- `alert_system.js`: Version `3.1.3`
- Feature: `alert_bus_safe_parallel_integration`
- Alert-Output-Modus: `legacy_and_bus`
- Communication-Bus-Channel: `visual.alert`
- Actions: `play`, `clear`

## Was STEP453 ändert

STEP453 aktiviert Alerts sicher parallel über den Communication-Bus. Der bisherige Legacy-Overlay-Weg bleibt aktiv und wird nicht entfernt.

Damit gilt:

```text
Alert kommt rein
→ Legacy-Overlay bekommt den Alert wie bisher
→ Communication-Bus bekommt denselben Alert zusätzlich über visual.alert/play
→ Alert-Overlay kann Bus-Events bereits empfangen und ACKs senden
```

## Sicherheitsverhalten

- Kein `bus_only`.
- Kein Entfernen des Legacy-Fallbacks.
- Kein Umbau von Sound-System, TTS, Bundle-Queue oder Dashboard.
- Wenn die bestehende JSON-/DB-Config noch `alertOutput.mode = legacy` enthält, hebt STEP453 den Runtime-Modus ohne gesetzte Env-Override sicher auf `legacy_and_bus` an.
- Bei Bedarf kann der Modus per `ALERT_OUTPUT_MODE` explizit überschrieben werden.

## Nächster möglicher Schritt

Wenn ein echter Live-/Dashboard-Alert sichtbar bleibt und der Bus parallel Events liefert, kann später ein separater kleiner Schritt auf `bus_first` umstellen. Bis dahin bleibt STEP453 bewusst der sichere Parallelbetrieb.
