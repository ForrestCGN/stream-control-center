# NEXT_STEPS

## Naechster Schritt

```text
CAN-22.1 - Safety Architecture Backend Shape File Inspection Planning
```

## Ziel CAN-22.1

Vor einer spaeteren technischen Planung die echten GitHub/dev-Dateien gezielt pruefen und dokumentieren, welche vorhandenen Strukturen genutzt werden koennen.

## CAN-22.1 darf klaeren

```text
welche Funktionen in backend/modules/bus_diagnostics.js existieren
welche Routen dort bereits vorhanden sind
welche Status-/Safety-Felder bereits vorhanden sind
welche Dashboard-Struktur in htdocs/dashboard/modules/bus_diagnostics.js existiert
ob communication_bus.js relevant ist
welche bestehende Helfer genutzt werden koennen
```

## CAN-22.1 darf NICHT enthalten

```text
Code-Aenderung
API
Route
DB
Middleware
Dashboard-Aenderung
EventBus-Emit
Recovery-Ausfuehrung
SafetyStop Clear
Confirm Trigger
Rollen-/Rechte-Mutation
Queue-/Sound-/Alert-/Overlay-Mutation
Validation-Code
```
