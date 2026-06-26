# NEXT_STEPS

Stand: RDAP54_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PLAN  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP55_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PREPARED
```

## Ziel

```text
Kleiner Frontend-only Polish: Die Anzeige `0 Targets` bei modulbezogenen Rechten klarer erklaeren.
```

## Richtung

```text
- Bestehendes /api/remote/auth/model weiterverwenden.
- Bestehende Datei `remote-modboard/backend/public/assets/rdap53-permission-read-detail.js` erweitern.
- Keine neue Datei, wenn bestehende RDAP53-Datei fachlich passt.
- Bei leeren modulePermissions besser erklaeren:
  - rolePermissions sind vorhanden.
  - modulePermissions sind aktuell leer.
  - 0 Targets ist deshalb plausibel und kein UI-Fehler.
- Keine neue Backend-Route.
- Keine DB-Migration.
- Keine Writes.
```

## Vorher pruefen

```text
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP54.md
docs/current/RDAP54_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PLAN.md
docs/current/RDAP53B_PERMISSION_READ_DETAIL_POLISH_LIVE_CONFIRMED_DOCS.md
remote-modboard/backend/public/assets/rdap53-permission-read-detail.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/auth-db-read.service.js
```

## Nicht in diesem Step aendern

```text
Keine Backend-Aenderung ohne separaten Plan.
Keine DB-Migration.
Keine Permission-Verwaltung mit Writes.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein Delete.
Keine Community-Read-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```
