# NEXT_STEPS

## Naechster Kandidat

```text
CAN-23.0 - Safety Architecture Backend Shape Internal Function read-only implementation
```

## Ziel CAN-23.0

Eine interne read-only Funktion in `backend/modules/bus_diagnostics.js` ergaenzen.

## CAN-23.0 darf maximal enthalten

```text
eine interne Funktion in backend/modules/bus_diagnostics.js
keine Einbindung in Response
keine neue Route
keine neue API
keine Dashboard-Aenderung
keine DB
kein EventBus-Emit
keine Recovery
```

## Pflicht bei CAN-23.0

```text
echte Datei erneut aus GitHub/dev lesen
keine bestehende Funktionalitaet entfernen
node -c backend\modules\bus_diagnostics.js ausfuehren
ZIP mit echter Datei liefern
Doku/Projektstatus aktualisieren
Rollback-Hinweis dokumentieren
```

## CAN-23.0 darf NICHT enthalten

```text
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
Response-Einbindung
Validation-Code ausserhalb der internen Planung
```
