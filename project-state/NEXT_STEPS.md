# NEXT_STEPS

## Naechster Schritt

```text
CAN-17.1 - Roles/Rights Action Matrix no-mutation Planning
```

## Ziel CAN-17.1

Eine detailliertere Aktionsmatrix fuer Rollen/Rechte planen, ohne Rechte technisch umzusetzen.

## CAN-17.1 darf klaeren

```text
welche read-only Aktionen spaeter welche Rolle brauchen koennten
welche high-risk Aktionen unabhaengig von Rollen blockiert bleiben
welche Aktionen eigene separate Planung brauchen
welche Aktionen niemals durch UI-Only freigegeben werden duerfen
```

## CAN-17.1 darf NICHT enthalten

```text
Rollen-API
Rechte-API
Login-/User-System
DB-Tabelle
Dashboard-Rechte-Durchsetzung
Mutation
Recovery-Ausfuehrung
POST-Route
SafetyStop Clear
Confirm Trigger
Queue-/Sound-/Alert-/Overlay-Mutation
```
