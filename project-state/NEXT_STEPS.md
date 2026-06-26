# NEXT_STEPS

Stand: RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN
```

## Ziel

```text
Planen, ob und wie Admin-Note Update und/oder Deactivate spaeter sicher gebaut werden duerfen.
```

## Richtung

```text
- Plan-only.
- Keine direkte Update-/Deactivate-Implementierung.
- Keine DB-Migration.
- Keine produktiven Writes.
- Keine UI-Schreibbuttons ohne separaten Implementierungs-Step.
- Keine Rollen-/Gruppen-/Permission-Writes.
- Update und Deactivate wahrscheinlich getrennt planen/bauen.
```

## Leitfragen

```text
- Soll zuerst Update oder Deactivate geplant werden?
- Welche Felder duerfen geaendert werden?
- Welche Permission ist noetig?
- Welcher Confirm-Write-Weg gilt?
- Welcher Lock-Scope gilt?
- Welche Audit-Payload ist Pflicht?
- Welche Read-Back-Pruefung ist Pflicht?
- Welches Backup-/Rollback-Konzept ist noetig?
- Welche UI darf spaeter Buttons anzeigen?
- Was bleibt ausdruecklich verboten?
```

## Alternative falls noch kein Write-Scope gewuenscht ist

```text
RDAP60_ADMIN_NOTES_READ_ONLY_UI_STATUS_POLISH_PLAN
```

Moegliches Ziel:

```text
Nur Admin-Notes read-only UI/Status verstaendlicher machen, ohne neue Writes, ohne neue Route, ohne DB.
```

## Vorher pruefen

```text
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP59.md
docs/current/RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN.md
docs/current/RDAP58_PERMISSION_READ_DETAIL_WRAPUP_OR_NEXT_AREA_PLAN.md
docs/current/RDAP57B_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_LIVE_CONFIRMED_DOCS.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Fuer Admin-Notes-Codeplanung zusaetzlich:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-disabled.service.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Nicht direkt aendern

```text
Keine Backend-Aenderung ohne separaten Plan.
Keine DB-Migration ohne separaten DB-Step.
Keine Community-Read-Freigabe.
Keine Permission-Verwaltung mit Writes.
Kein Admin-Note Update direkt ohne Plan.
Kein Admin-Note Deactivate direkt ohne Plan.
Kein Delete.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```
