# STEP454 – Alert Bus First Productive Switch

## Ziel

Alerts sollen produktiv Bus-First laufen, ohne die Sicherheit des bestehenden Legacy-Wegs zu verlieren.

## Ausgangslage

STEP453 hat Alerts sicher parallel angebunden:

```text
legacy_and_bus
```

Der Status wurde erfolgreich auf Parallelbetrieb gesetzt:

```text
mode: legacy_and_bus
legacyEnabled: True
busEnabled: True
busOnly: False
```

Das Alert-Overlay kann Bus-Events auf `visual.alert` für `play` und `clear` verarbeiten und ACKs senden.

## Entscheidung

Für STEP454 wird auf den produktiven Migrationsmodus gewechselt:

```text
bus_first
```

Dabei bleibt Legacy als Fallback aktiv.

## Umsetzung

`backend/modules/alert_system.js`:

- Modulversion auf `3.1.4` erhöht.
- Default für `alertOutput.mode` auf `bus_first` gesetzt.
- Bestehende `bus_first`-Logik bleibt unverändert:
  - Bus-Ausgabe zuerst.
  - Wenn Bus nicht erfolgreich liefert oder keine Empfänger erreicht, wird Legacy automatisch als Fallback gesendet.

## Produktiver Flow nach STEP454

```text
Alert kommt rein
→ alert_system.js
→ Communication-Bus visual.alert/play zuerst
→ Alert-Overlay empfängt Bus-Event und ACKt
→ falls Bus nicht liefert: Legacy-Overlay-Fallback
```

## Nicht geändert

- Kein `bus_only`.
- Kein Entfernen des Legacy-Fallbacks.
- Kein Sound-System-Umbau.
- Kein TTS-Umbau.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Keine Alert-Regeländerung.
- Keine bestehende Funktionalität entfernt.

## Wichtig zur Runtime-Config

Wenn die gespeicherte Alert-Konfiguration aus JSON/DB noch `legacy_and_bus` enthält, muss der Runtime-Modus einmal per API gesetzt werden:

```powershell
$body = @{
  alertOutput = @{
    mode = "bus_first"
    bus = @{
      enabled = $true
      channel = "visual.alert"
      action = "play"
      clearAction = "clear"
      requireAck = $true
      replayable = $true
      ttlMs = 60000
      targetType = "all"
      targetId = "*"
      targetModule = ""
      targetCapability = ""
    }
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/alerts/config" `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json -Depth 10
```

## Test / Abschluss

```powershell
cd D:\Git\stream-control-center

node --check backend\moduleslert_system.js

.\stepdone.cmd "STEP454 Alert Bus First Productive Switch"
```

## Einfache Statusprüfung

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status"
$s.alertOutput | Select-Object mode,legacyEnabled,busEnabled,busOnly,legacyFallbackEnabled
```

Erwartung:

```text
mode: bus_first
legacyEnabled: False
busEnabled: True
busOnly: False
legacyFallbackEnabled: True
```
