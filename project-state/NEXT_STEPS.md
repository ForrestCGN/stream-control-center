# NEXT_STEPS

## Naechster Schritt

```text
CAN-22.2 - Safety Architecture Backend Shape Implementation Candidate Decision no-code
```

## Ziel CAN-22.2

Entscheiden, welche spaetere technische Variante am sichersten waere.

## CAN-22.2 darf klaeren

```text
nur interne Funktion oder bestehende read-only Response erweitern
ob dashboard spaeter separat bleibt
welche Datei spaeter primaer betroffen waere
welche Tests spaeter Pflicht waeren
welche No-Go-Grenzen weiter gelten
```

## CAN-22.2 darf NICHT enthalten

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
