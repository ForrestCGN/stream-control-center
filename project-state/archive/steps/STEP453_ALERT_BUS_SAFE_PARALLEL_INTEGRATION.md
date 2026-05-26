# STEP453 – Alert Bus Safe Parallel Integration

## Ziel

Alerts sollen sicher an den Communication-Bus angebunden werden, ohne den bestehenden sichtbaren Alert-Weg zu gefährden.

## Ausgangslage

VIP wurde in STEP452 produktiv über das Node-Command-System und den Sound-Bus integriert.

Alerts hatten bereits vorbereitete Bus-Strukturen:

- `alertOutput.mode` unterstützt `legacy`, `legacy_and_bus`, `bus_first`, `bus_only`.
- Der Bus-Channel für visuelle Alerts ist `visual.alert`.
- Das Alert-Overlay kann Bus-Events für `play` und `clear` verarbeiten.
- Legacy-Overlay-Ausgabe existiert weiterhin.

## Entscheidung

Für STEP453 wird bewusst nicht direkt `bus_first` aktiviert.

Stattdessen wird der sichere Parallelmodus verwendet:

```text
legacy_and_bus
```

Dadurch bleibt der bisherige Alert sichtbar, während der Communication-Bus denselben Alert zusätzlich bekommt.

## Umsetzung

`backend/modules/alert_system.js`:

- Modulversion auf `3.1.3` erhöht.
- Default für `alertOutput.mode` auf `legacy_and_bus` gesetzt.
- Runtime-Schutz ergänzt:
  - Wenn kein `ALERT_OUTPUT_MODE` gesetzt ist und die bestehende Config noch `legacy` liefert, wird aktiv `legacy_and_bus` verwendet.
  - Wenn `ALERT_OUTPUT_MODE` gesetzt ist, darf dieser Wert den Modus bewusst überschreiben.

## Produktiver Flow nach STEP453

```text
Alert kommt rein
→ alert_system.js
→ Legacy-Overlay-Ausgabe bleibt aktiv
→ zusätzlich Communication-Bus visual.alert/play
→ Alert-Overlay kann Bus-Event empfangen und ACK senden
```

## Nicht geändert

- Kein `bus_first`.
- Kein `bus_only`.
- Kein Entfernen des Legacy-Wegs.
- Kein Sound-System-Umbau.
- Kein TTS-Umbau.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Keine Alert-Regeländerung.
- Keine bestehende Funktionalität entfernt.

## Test / Abschluss

```powershell
cd D:\Git\stream-control-center

node --check backend\modules\alert_system.js

.\stepdone.cmd "STEP453 Alert Bus Safe Parallel Integration"
```

## Einfache Statusprüfung

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status"
$s.alertOutput | Select-Object mode,legacyEnabled,busEnabled,busOnly,legacyFallbackEnabled
```

Erwartung:

```text
mode: legacy_and_bus
legacyEnabled: True
busEnabled: True
busOnly: False
```
