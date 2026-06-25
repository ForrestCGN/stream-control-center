# RDAP17 – Admin-Notiz Read-Diagnostic read-only

Stand: 2026-06-25  
Projekt: `stream-control-center` / RDAP Remote-Modboard  
Branch: `dev`

## Ziel

RDAP17 ergänzt eine kleine read-only Diagnose-Route für die neu angelegte Tabelle `dashboard_user_admin_notes`.

Die Route ist absichtlich noch keine produktive Anzeige im Dashboard und kein echter Admin-Notiz-Write.

## Neue Route

```text
GET /api/remote/admin/users/admin-note-read-diagnostic
GET /api/remote/admin/users/admin-note-read-diagnostic?targetUserUid=<uid>
```

## Verhalten

- prüft lesend, ob `dashboard_user_admin_notes` vorhanden ist
- liest nur Metadaten/Counts
- optional: liest Notiz-Metadaten zu `targetUserUid`
- gibt **keinen Notiztext** aus
- `noteText` bleibt `null`
- `noteTextRedacted: true`
- `returnsNoteText: false`
- `writeEnabled: false`
- `productiveWritesEnabled: false`
- `writesStillBlocked: true`

## Warum keine Notiztexte?

Die aktuelle RDAP-/Auth-Schicht ist noch nicht final für echte Admin-Notiz-Anzeige freigegeben. Admin-Notizen sind interne Daten und dürfen später nur serverseitig geprüft über Rollen/Rechte sichtbar werden.

Darum ist RDAP17 nur Diagnose/Grundlage, nicht UI-Anzeige.

## Betroffene Dateien

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-read-diagnostic.service.js
remote-modboard/backend/package.json
docs/current/RDAP_ADMIN_USERS17_ADMIN_NOTE_READ_DIAGNOSTIC.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Nicht geändert

```text
Keine DB-Migration
Keine SQL-Ausführung
Keine Inserts
Keine Updates
Keine Deletes
Keine Admin-Notiz-Write-Route
Keine UI-Schreibbuttons
Keine User-/Rollen-/Session-Änderung
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
Keine Workflow-Tools
```

## Tests lokal

```powershell
cd D:\Git\stream-control-centeremote-modboardackend
node --check .\srcoutesdmin-users.routes.js
node --check .\srcoutesoutes.routes.js
node --check .\src\servicesdmin-user-admin-note-read-diagnostic.service.js
npm run check
```

## Tests Webserver nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminUsersAdminNoteReadDiagnostic'

curl -fsS http://127.0.0.1:3010/api/remote/admin/users/admin-note-read-diagnostic | jq

curl -fsS 'http://127.0.0.1:3010/api/remote/admin/users/admin-note-read-diagnostic?targetUserUid=test-user' | jq
```

Erwartung:

```text
readOnly: true
writeEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
returnsNoteText: false
noteTextIsRedacted: true
totalCount: 0
```

## Nächster Schritt danach

Erst danach kann ein echter Anzeige-/UI-Step geplant werden. Der muss Auth/Permission sauber berücksichtigen. Ein Write-Step bleibt weiterhin getrennt und braucht Permission, Confirm-Write, Audit, Lock und Read-Back.
