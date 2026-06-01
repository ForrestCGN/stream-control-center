# NEXT_STEPS

## Naechster Schritt

```text
CAN-17.2 - Roles/Rights Backend Boundary no-implementation Planning
```

## Ziel CAN-17.2

Planen, welche Backend-Grenzen ein spaeteres Rollen-/Rechte-System haben muss, ohne Backend-Code zu bauen.

## CAN-17.2 darf klaeren

```text
serverseitige Pruefung als Pflicht
kein Trust auf Client
no-implementation Grenzen
welche Module spaeter betroffen waeren
welche Routen weiterhin nicht existieren
welche Entscheidungen spaeter auditierbar sein muessen
```

## CAN-17.2 darf NICHT enthalten

```text
Rollen-API
Rechte-API
Login-/User-System
DB-Tabelle
Dashboard-Rechte-Durchsetzung
Middleware
Mutation
Recovery-Ausfuehrung
POST-Route
SafetyStop Clear
Confirm Trigger
Queue-/Sound-/Alert-/Overlay-Mutation
```
