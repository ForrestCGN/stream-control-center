# CURRENT SYSTEM STATUS

Aktueller Stand: STEP454 – Alert Bus First Productive Switch.

## Runtime-Stand

- `alert_system.js`: Version `3.1.4`
- Feature: `alert_bus_first_productive_switch`
- Alert-Output-Modus: `bus_first`
- Communication-Bus-Channel: `visual.alert`
- Actions: `play`, `clear`

## Was STEP454 ändert

STEP454 schaltet Alerts vom sicheren Parallelbetrieb auf Bus-First um.

Damit gilt:

```text
Alert kommt rein
→ Communication-Bus bekommt visual.alert/play zuerst
→ Alert-Overlay empfängt Bus-Event und sendet ACK
→ Legacy-Overlay bleibt als Fallback aktiv, falls Bus-Auslieferung nicht klappt
```

## Sicherheitsverhalten

- Kein `bus_only`.
- Legacy-Fallback bleibt aktiv.
- Keine Entfernung bestehender Alert-Routen.
- Kein Umbau von Sound-System, TTS, Bundle-Queue oder Dashboard.
- Wenn gespeicherte JSON-/DB-Config einen anderen Modus setzt, muss `alertOutput.mode` einmal per Alert-Config-API auf `bus_first` gesetzt werden.

## Nächster möglicher Schritt

Erst nach stabiler Bus-First-Livephase kann später ein separater kleiner Schritt auf `bus_only` oder Legacy-Cleanup geplant werden. Das ist jetzt ausdrücklich nicht Teil von STEP454.
