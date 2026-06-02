# NEXT_STEPS

## Naechster empfohlener Schritt

```text
CAN-20.0 - Safety Architecture Backend Shape read-only/no-route Planning
```

## Ziel CAN-20.0

Planen, wie ein spaeteres internes Backend-Objekt fuer die Safety Architecture aussehen koennte, ohne Route/API/DB/Dashboard zu bauen.

## CAN-20.0 darf klaeren

```text
interne Objektstruktur
read-only Feldwerte
Modulstatus-Struktur
HardBlocker-Struktur
technicalBoundaries-Struktur
Fehler-/Warning-Struktur
```

## CAN-20.0 darf NICHT enthalten

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
```
