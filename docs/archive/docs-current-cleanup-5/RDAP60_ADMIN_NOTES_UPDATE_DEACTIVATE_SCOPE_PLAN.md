# RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN

Datum: 2026-06-26
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP60 klaert als reiner Plan-Step, ob und wie Admin-Note Update und/oder Deactivate spaeter sicher gebaut werden duerfen.

RDAP60 ist Doku-only / Plan-only.

Es wird nichts gebaut.

## Ausgangspunkt

Bestaetigter Stand nach RDAP59:

```text
Admin-Notizen bleiben vorerst Admin-only.
Community-Read wird nicht gebaut.
Bestehende Admin-Readroute wird nicht fuer Community-/Profil-/Public-UI verwendet.
Falls spaeter noetig, dann nur separater, stark begrenzter read-only Scope mit eigener Planung, eigener Permission, Datenminimierung und ohne Public-Leak.
```

Admin-Notes aktueller Strukturstand:

```text
Bestehende Admin-Notes-Routen liegen aktuell in:
remote-modboard/backend/src/routes/admin-users.routes.js

Nicht vorhanden unter GitHub/dev beim RDAP59-Startcheck:
remote-modboard/backend/src/routes/admin-users-admin-notes.routes.js
```

Bestehende Admin-Notes-Routen:

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

## Aktueller Write-Stand

Admin-Note Create ist bewusst vorbereitet/live.

Der bestehende Create-Service:

```text
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
```

setzt fuer Create bereits wesentliche Schutzbausteine um:

```text
- gueltige Session
- DashboardAccess
- remote.view
- admin.users.note.write
- confirmWrite nur aus JSON-Body
- Zieluser-Validierung
- Tabellen-/Schema-Pruefung
- Lock auf admin_user_note:<targetUserUid>:create
- Audit attempt/success/failure ohne raw note_text
- Insert in dashboard_user_admin_notes
- Read-Back nach Write
- Lock Release
```

Weiterhin gilt dort:

```text
adminNoteCreateEnabled: true
adminNoteUpdateEnabled: false
adminNoteDeactivateEnabled: false
physicalDeleteEnabled: false
communityPagesMayReadAdminNotes: false
```

Die bestehenden Update-/Deactivate-Routen nutzen aktuell:

```text
remote-modboard/backend/src/services/admin-user-admin-note-write-disabled.service.js
```

Dieser Service validiert nur lesend:

```text
- Action create/update/deactivate
- Session
- DashboardAccess
- remote.view
- admin.users.note.read
- admin.users.note.write als Modell-/Pruefkontext
- confirmWrite
- targetUserUid
- noteUid fuer update/deactivate
- noteText fuer update
- Tabelle/Schema
- Zieluser
- bestehende Notiz
- Audit-Draft
- Lock-Draft
```

Er fuehrt aber keinen produktiven Update-/Deactivate-Write aus:

```text
writeEnabled: false
databaseWriteEnabled: false
productiveWritesEnabled: false
updatesNote: false
deactivatesNote: false
deletesNote: false
physicalDeleteEnabled: false
```

## Entscheidung RDAP60

Update und Deactivate sollen nicht gemeinsam gebaut werden.

Empfehlung:

```text
1. Zuerst nur Admin-Note Update planen.
2. Deactivate danach separat planen.
3. Implementierung erst nach diesem Plan in eigenem Step.
```

Begruendung:

```text
Update veraendert bestehenden Notiztext und updated_by/updated_at.
Deactivate veraendert den Status und damit Sichtbarkeit/Auswertung.
Beides hat unterschiedliche Fehlerfaelle, Audit-Anforderungen und UI-Risiken.
Ein Misch-Step waere unnoetig riskant.
```

## Empfohlener Folgestep nach RDAP60

```text
RDAP61_ADMIN_NOTE_UPDATE_BACKEND_SCOPE_PLAN_OR_IMPLEMENTATION
```

Besser genauer:

```text
RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
```

Aber nur, wenn Forrest nach RDAP60 ausdruecklich Update als naechsten echten Write-Step freigibt.

## Kleinster sinnvoller Update-Scope

Ein spaeterer Update-Step soll nur vorhandene aktive Admin-Notizen editieren.

Erlaubte Eingaben spaeter:

```text
targetUserUid
noteUid
noteText
confirmWrite: true
```

Nicht erlaubte Eingaben fuer Update:

```text
status
created_by_user_uid
created_at
updated_by_user_uid frei aus Body
updated_at frei aus Body
note_uid Aenderung
target_user_uid Aenderung
includeInactive fuer Write
physisches Delete
```

Serverseitig zu setzen:

```text
note_text = validierter noteText
updated_by_user_uid = actor.userUid
updated_at = now
```

Nur wenn:

```text
Notiz existiert.
Notiz gehoert zu targetUserUid.
Notiz status = active.
```

Kein Update auf inactive/deactivated Notizen im ersten Scope.

## Update-Permission

Fuer den ersten Update-Scope soll weiterhin verwendet werden:

```text
admin.users.note.write
```

Zusaetzlich weiter erforderlich:

```text
remote.view
DashboardAccess
valid session
```

Nicht in RDAP60 aendern:

```text
Keine neue Permission-Migration.
Keine Rollen-/Gruppen-/Permission-Zuweisung.
Keine UI-Permission-Verwaltung.
```

Falls spaeter feiner getrennt werden soll, dann erst separat planen:

```text
admin.users.note.update
admin.users.note.deactivate
```

Nicht jetzt.

## Confirm-Write-Regel

Ein spaeterer Update-Write muss denselben harten Confirm-Weg wie Create verwenden:

```text
confirmWrite muss true im JSON-Body sein.
Query-Confirm bleibt verboten.
Kein Header-Confirm.
Kein implizites UI-Confirm.
```

Fehlt confirmWrite, muss der Write abbrechen, bevor irgendein DB-Write passiert.

## Lock-Scope fuer Update

Empfohlen:

```text
resourceType: admin_user_note
resourceKey: admin_user_note:<noteUid>
lockScope: admin.users.note:<targetUserUid>
```

Alternativ enger:

```text
lockScope: admin.users.note:<targetUserUid>:<noteUid>
```

Empfehlung fuer ersten Step:

```text
admin.users.note:<targetUserUid>
```

Grund:

```text
Dadurch kann nicht parallel eine zweite Admin-Notiz-Aenderung fuer denselben Zieluser laufen.
Das ist konservativer und sicherer fuer den ersten Write-Ausbau.
```

Lock-Regeln:

```text
Lock vor Audit/Update erwerben.
Bei Fehler Lock sauber releasen.
Bei Erfolg Lock releasen.
Lock-Fehler muss Write verhindern.
Kein Force-Takeover in diesem Scope.
```

## Audit-Payload fuer Update

Audit darf niemals raw note_text speichern.

Empfohlene Audit-Actions:

```text
admin.user_note.update
```

Audit attempt:

```text
status: attempt
resource_type: admin_user_note
resource_key: admin_user_note:<noteUid>
permission_key: admin.users.note.write
old_value_summary: null oder sichere Kurzinfo
new_value_summary: Admin-Notiz Update versucht; target=<targetUserUid>; note=<noteUid>; oldLength=<n>; newLength=<n>.
safe_metadata_json:
  step
  targetUserUid
  noteUid
  oldNoteTextLength
  newNoteTextLength
  confirmWriteAccepted: true
  rawNoteTextLogged: false
```

Audit success:

```text
status: success
old_value_summary: vorherige sichere Kurzinfo ohne Textinhalt
new_value_summary: Update erfolgreich; target=<targetUserUid>; note=<noteUid>; oldLength=<n>; newLength=<n>.
```

Audit failure:

```text
status: failure
error_code: publicDbError / validierter Fehlercode
rawNoteTextLogged: false
```

## Read-Back-Pflicht fuer Update

Nach Update muss serverseitig gelesen werden:

```text
noteUid
targetUserUid
status
noteTextLength
updatedByUserUid
updatedAt
```

Pflichtpruefung:

```text
readBack.exists === true
readBack.noteUid === noteUid
readBack.targetUserUid === targetUserUid
readBack.status === active
readBack.noteTextLength === noteText.length
readBack.updatedByUserUid === actor.userUid
updatedAt wurde geaendert/gesetzt
```

Response darf den kompletten note_text nur dann enthalten, wenn es fuer die bestehende Admin-UI wirklich noetig ist.

Empfehlung fuer Update-Response:

```text
noteTextReturned: false
noteTextLength returned
readBackPerformed: true
readBackFound: true
```

Danach soll die UI die bestehende Readroute neu laden, falls spaeter UI gebaut wird.

## Backup-/Rollback-Konzept

Vor erstem produktiven Update-Implementierungsstep muss mindestens geplant sein:

```text
DB-Backup vor Deploy/Write-Test.
Read-only Vorpruefung der Tabelle dashboard_user_admin_notes.
Read-only Vorpruefung von dashboard_audit_log und dashboard_locks.
Rollback fuer einzelne Note ist ueber Audit old/new-Length nicht ausreichend, weil raw text bewusst nicht geloggt wird.
Fuer echten Rollback braucht es DB-Backup oder separate sichere Before-Snapshot-Strategie.
```

Wichtig:

```text
Raw note_text darf nicht im Audit landen.
Wenn Rollback auf Textinhalt noetig ist, nur ueber DB-Backup oder separate verschluesselte/sichere Snapshot-Planung.
```

Fuer ersten Update-Step reicht:

```text
Vorher DB-Backup.
Read-Back nach Update.
Bei Fehler kein automatischer Text-Rollback, sondern Step abbrechen und Backup manuell verfuegbar halten.
```

## UI fuer spaeteren Update-Step

RDAP60 baut keine UI.

Falls spaeter UI gebaut wird:

```text
Update-Button nur in Admin -> Admin-Notizen.
Nur bei erfolgreicher Readroute.
Nur wenn serverseitig admin.users.note.write als erlaubt erkannt wurde.
Nur fuer aktive Notizen.
Keine Buttons in Community/Public/Profile/Self-Service.
Kein Deactivate-Button im ersten Update-UI-Step.
```

UI muss nach Update:

```text
Create/Update Busy-State setzen.
confirmWrite im JSON-Body senden.
Nach Erfolg Readroute neu laden.
Fehler sichtbar anzeigen.
Keine lokale Optimistic-Mutation ohne Readback.
```

## Deactivate spaeter separat planen

Deactivate ist nicht Update.

Deactivate soll spaeter separat geplant werden, weil es Status/Sichtbarkeit aendert.

Moeglicher spaeterer Step:

```text
RDAP62_ADMIN_NOTE_DEACTIVATE_SCOPE_PLAN
```

Oder nach erfolgreichem Update:

```text
RDAP62_ADMIN_NOTE_DEACTIVATE_BACKEND_IMPLEMENTATION_PLAN
```

Deactivate-Regeln spaeter wahrscheinlich:

```text
status active -> inactive/deactivated
updated_by_user_uid = actor.userUid
updated_at = now
kein note_text veraendern
kein physisches Delete
separate Audit-Action admin.user_note.deactivate
separater Confirm-Write
separater UI-Button erst nach Backend-Bestaetigung
```

Nicht in RDAP60 bauen.

## Was RDAP60 ausdruecklich nicht tut

```text
Keine Code-Aenderung.
Keine Backend-Route.
Keine Frontend-UI.
Keine DB-Migration.
Keine produktiven Writes.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine Community-Read-Freigabe.
Keine Nutzung der bestehenden Admin-Readroute ausserhalb Admin.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Session-Revocation.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Ergebnis

```text
RDAP60 entscheidet:
Update und Deactivate werden nicht gemeinsam gebaut.
Zuerst soll nur Admin-Note Update als kleinster sinnvoller Write-Scope vorbereitet werden.
Deactivate bleibt danach ein eigener separater Scope.
RDAP60 selbst bleibt Doku-only/Plan-only.
```

## Naechster sinnvoller Step nach RDAP60

Empfohlen:

```text
RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
```

Aber nur nach neuem Startcheck, echtem Datei-Lesen, kurzem Plan und Forrests ausdruecklichem go.

RDAP61 darf dann Backend-Code anfassen, aber weiterhin keine Deactivate-/Delete-/Community-Read-/Permission-Verwaltung mitbauen.
