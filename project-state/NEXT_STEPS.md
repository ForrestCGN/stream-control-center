# NEXT_STEPS

Stand: RDAP51B_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN
```

## Ziel

```text
Bessere read-only Planung fuer Permission-/Rollen-Details im Admin-Bereich, ohne Schreibverwaltung zu aktivieren.
```

## Richtung

```text
- Bestehendes /api/remote/auth/model auswerten.
- Rollen, Gruppen, Role-Permissions und Module-Permissions read-only einordnen.
- Effektive Rechte nur anzeigen/erklaeren.
- Keine Rollen-/Permission-Vergabe.
- Keine Session-Revocation.
- Keine neue Backend-Route, wenn vorhandene Daten reichen.
```

## Vorher pruefen

```text
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP51B.md
docs/current/RDAP51B_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_LIVE_CONFIRMED_DOCS.md
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/assets/remote-modboard.js
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
