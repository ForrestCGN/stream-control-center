# EVENTBUS_CAN2_2_OPTIONAL_DIAGNOSTICS_CLEANUP

Stand: 2026-06-01  
Status: Read-only Diagnose-Cleanup  
Scope: `backend/modules/bus_diagnostics.js`

## Ziel

CAN-2.2 bereinigt die Bewertung der Bus-Diagnose-Warnungen, ohne produktive Flows zu verändern.

Die folgenden Hinweise sind keine echten Fehler, solange die Hauptsysteme und die Resilience-Matrix gruen sind:

```text
sound_eventbus_debug_not_connected
alert_eventbus_debug_not_connected
vip_sound_overlay_v2_not_connected
```

Sie werden deshalb nicht mehr als `warnings`, sondern als `optionalInfo` ausgegeben.

## Geaenderte Datei

```text
backend/modules/bus_diagnostics.js
```

## Änderung

```text
bus_diagnostics 1.2.0 -> 1.2.1
build STEP_CAN2 -> STEP_CAN2_2
optionalInfo[] hinzugefuegt
summary.optionalInfoCount hinzugefuegt
Debug-/optionale Overlay-Hinweise von warnings nach optionalInfo verschoben
```

## Nicht geaendert

```text
Keine neuen Module
Keine neuen Helper
Keine Queue-Aenderung
Keine Sound-Aenderung
Keine Alert-Aenderung
Keine Overlay-Aenderung
Keine DB-/Config-Aenderung
Keine Recovery-Automatik
```

## Erwartung nach Live-Test

```text
/api/bus-diagnostics/check zeigt version 1.2.1
summary.status ist ok, wenn nur optionale Debug-/Overlay-Hinweise fehlen
warnings enthaelt keine *_debug_not_connected oder vip_sound_overlay_v2_not_connected Hinweise mehr
optionalInfo enthaelt die optionalen Hinweise
resilienceMatrix bleibt readOnly und gruen
```
