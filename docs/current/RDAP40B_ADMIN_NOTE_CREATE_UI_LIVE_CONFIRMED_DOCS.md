# RDAP40B_ADMIN_NOTE_CREATE_UI_LIVE_CONFIRMED_DOCS

Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Doku-only nach erfolgreichem RDAP40 Live-Test

## Zweck

RDAP40 wurde live auf dem Webserver bestaetigt. Die Admin-Notizen-UI kann jetzt fuer berechtigte Admins eine neue interne Admin-Notiz erstellen und danach die Liste per wiederhergestellter Read-Route aktualisieren.

Dieser Schritt dokumentiert nur den bestaetigten Live-Zustand. Es werden keine Backend-, Frontend- oder DB-Migrationsdateien geaendert.

## Bestaetigter Live-Stand

```text
Service: scc-remote-modboard.service
Remote-Modboard Live-Pfad: /opt/stream-control-center/remote-modboard
Webserver-Subdomain: mods.forrestcgn.de
Branch: dev
Vorheriger Backend-Stand: RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED
Read-Route Restore: RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC
UI-Step: RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
```

## RDAP40 UI-Befund

Im Browser unter `https://mods.forrestcgn.de/` wurde bestaetigt:

```text
Admin -> Admin-Notizen
3 Admin-Notiz(en) geladen.
Button "Neue Notiz" sichtbar.
Create ist nur sichtbar, wenn admin.users.note.write erlaubt ist.
Neue Notiz wurde erstellt.
Liste wurde danach automatisch aktualisiert.
Keine Update-/Deactivate-/Delete-Buttons sichtbar.
```

## Erstellte RDAP40 Testnotiz

```text
note_uid: admin_note_20260625171342_d1f871dd6370
target_user_uid: tw:127709954
status: active
note_text: —test
created_at/updated_at im UI: 2026-06-25T17:13:42.000Z
```

## UI-Readback nach Create

Die UI zeigte danach drei aktive Notizen fuer `tw:127709954`:

```text
1. admin_note_20260625171342_d1f871dd6370
   Text: —test

2. admin_note_20260625104920_5fec9726d7a3
   Text: RDAP39 Testnotiz: erster kontrollierter Backend-Create-Write fuer ForrestCGN.

3. rdap29-test-note-forrestcgn-readonly-validation
   Text: RDAP29 Test-Notiz / Read-only Validation Seed
```

## Bestaetigter Routes-Status

Servercheck:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminNoteReadRestored, .adminNoteWriteConfirmed'
```

Ergebnis zusammengefasst:

```text
statusApiVersion: rdap_admin_note_read_restore39c.v1

adminNoteReadRestored:
- prepared: true
- route: /api/remote/admin/users/admin-notes/read
- method: GET
- statusApiVersion: rdap_admin_users27.v1
- routeRestoreBuild: RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC
- serviceBuild: RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
- readOnly: true
- writeEnabled: false
- databaseWriteEnabled: false
- productiveWritesEnabled: false
- communityPagesMayReadAdminNotes: false
- returnsNoteTextForAuthorizedAdmins: true

adminNoteWriteConfirmed:
- prepared: true
- route: /api/remote/admin/users/admin-notes/create
- method: POST
- statusApiVersion: rdap_admin_note_write39.v1
- permissionRequired: admin.users.note.write
- confirmWriteRequired: true
- bodyConfirmOnly: true
- auditRequired: true
- lockRequired: true
- readBackRequired: true
- writeEnabled: true
- databaseWriteEnabled: true
- productiveWritesEnabled: true
- adminNoteCreateEnabled: true
- adminNoteUpdateEnabled: false
- adminNoteDeactivateEnabled: false
- physicalDeleteEnabled: false
- communityPagesMayReadAdminNotes: false
```

## Wichtiger Hinweis zu `uiWriteButtonsEnabled`

In `adminNoteWriteConfirmed` steht weiterhin:

```text
uiWriteButtonsEnabled: false
```

Das ist nach RDAP40 semantisch unsauber, aber kein akuter Funktionsfehler.

Einordnung:

```text
- Der Wert stammt aus der RDAP39 Backend-Summary.
- RDAP39 meinte damit: Das Backend aktiviert nicht automatisch UI-Schreibbuttons.
- RDAP40 hat bewusst im Frontend einen Create-Button sichtbar gemacht, aber nur wenn die serverseitige Read-/Permission-Auswertung Schreibrecht erkennt.
- Update/Deactivate/Delete bleiben weiterhin nicht sichtbar und backendseitig deaktiviert.
```

Empfohlener Folge-Step:

```text
RDAP41_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP
```

Ziel waere nur eine saubere Status-/Summary-Formulierung, z. B. Trennung zwischen:

```text
backendAutoUiWriteButtonsEnabled: false
adminNoteCreateUiPrepared: true
adminNoteCreateButtonVisibleForWritePermission: true
```

Keine neue Schreibfunktion, keine DB-Migration.

## Bestaetigte Sicherheitsgrenzen

```text
Read-Route bleibt read-only.
Create nutzt bestehende RDAP39-Route.
confirmWrite bleibt serverseitig Pflicht.
Audit/Lock/Readback bleiben Backend-Pflicht.
Update bleibt deaktiviert.
Deactivate bleibt deaktiviert.
Physisches Delete bleibt verboten.
Community-Seiten lesen keine Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Control-Aenderung.
Keine freien Shell-/Datei-/Prozess-/URL-Ausfuehrungen.
Keine Secrets im Frontend.
Keine Secrets im Audit.
```

## Install-/Step-Hinweis

Dieser RDAP40B-Stand ist Doku-only. Lokal reicht:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP40B_ADMIN_NOTE_CREATE_UI_LIVE_CONFIRMED_DOCS.zip" "RDAP40B Admin-Note Create-UI live bestaetigt dokumentiert"
git status
.\stepdone.cmd "RDAP40B Admin-Note Create-UI live bestaetigt dokumentiert; Doku/Projektstatus/TODO/NEXT_STEPS/CHANGELOG aktualisiert"
```

Kein Webserver-Deploy fuer Doku-only noetig.
