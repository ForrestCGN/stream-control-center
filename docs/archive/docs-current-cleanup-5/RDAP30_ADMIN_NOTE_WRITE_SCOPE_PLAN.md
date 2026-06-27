# RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Planungs-/Scope-Step, **keine produktive Write-Implementierung**

---

## 1. Zweck

RDAP30 plant den kleinsten sinnvollen Write-Scope fuer Admin-Notizen im Remote-Modboard.

Wichtig:

```text
RDAP30 baut noch keine produktive Schreibfunktion.
RDAP30 vergibt keine Permission.
RDAP30 zeigt keine Schreibbuttons.
RDAP30 fuehrt keine DB-Write-Route aus.
RDAP30 fuehrt keine Audit-/Lock-Writes aus.
```

RDAP30 ist die fachliche Grundlage fuer einen spaeteren Implementierungsstep.

---

## 2. Ausgangsstand

Live bestaetigter Stand nach RDAP29B:

```text
Live-DB: MariaDB 11.8.6
DB-Name: c3stream_control
Admin-Notiz-Tabelle: dashboard_user_admin_notes
Zieluser ForrestCGN: tw:127709954
Testnotiz: 1 active Eintrag
UI: Admin -> Admin-Notizen zeigt 1 Notiz read-only
Write: false
Schreibbuttons: nicht sichtbar
Permission admin.users.note.write: nicht vergeben
```

Weiterhin blockiert:

```text
Admin-Notiz schreiben
Admin-Notiz aendern
Admin-Notiz loeschen
Permission admin.users.note.write
UI-Schreibbuttons
Audit-Inserts ueber Dashboard
Lock acquire/heartbeat/release/force-takeover
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Community-Seiten-Anbindung fuer Admin-Notizen
```

---

## 3. Ziel-Scope fuer spaetere Umsetzung

Empfohlener kleinster sinnvoller Write-Scope:

```text
create note
update note_text
deactivate note
```

Nicht im ersten Write-Scope:

```text
physisches DELETE
Notizen fuer Community-Seiten anzeigen
Bulk-Aktionen
Richtext/HTML
Dateianhaenge
Erwaehnungen/Benachrichtigungen
Rollen-/User-Verwaltung
Session-Widerruf
```

Begruendung:

- Admin-Notizen sind nachvollziehbare interne Verwaltungsdaten.
- Physisches Loeschen erschwert Nachvollziehbarkeit.
- `status = inactive` ist sicherer als `DELETE`.
- Read-only UI und DB-Schema sind bereits vorhanden.
- Der naechste Implementierungsstep kann dadurch klein und kontrollierbar bleiben.

---

## 4. Datenmodell

Bestehende Tabelle:

```text
dashboard_user_admin_notes
```

Relevante Spalten:

```text
id                  bigint unsigned auto_increment primary key
note_uid            varchar(96) unique not null
target_user_uid     varchar(64) not null
note_text           text not null
status              varchar(32) not null default active
created_by_user_uid varchar(64) null
updated_by_user_uid varchar(64) null
created_at          datetime not null default current_timestamp
updated_at          datetime not null default current_timestamp on update current_timestamp
```

Fuer den ersten Write-Scope werden keine neuen Spalten benoetigt.

Status-Regel:

```text
active   = sichtbar in normaler Read-only Ansicht
inactive = deaktiviert/soft-deleted, nur mit includeInactive sichtbar
```

---

## 5. Permission

Geplante Permission:

```text
admin.users.note.write
```

Regel:

```text
remote.view muss weiterhin vorhanden sein.
admin.users.note.read muss fuer Lesen vorhanden sein.
admin.users.note.write ist fuer create/update/deactivate erforderlich.
```

Owner kann die Permission spaeter bekommen, aber RDAP30 vergibt sie nicht.

Keine Wildcard-/implizite Admin-Annahme bauen. Die effektive Permission muss ueber das vorhandene Rollen-/Permission-System laufen.

---

## 6. Confirm-Write

Jede spaetere Write-Route muss `confirmWrite=true` verlangen.

Ohne Confirm:

```json
{
  "ok": false,
  "error": "confirm_write_required"
}
```

Akzeptiert werden soll nur eine eindeutige Bestaetigung, z. B.:

```text
?confirmWrite=true
```

oder ein sauber dokumentierter Body-Wert, falls im Projektstandard vorhanden.

---

## 7. Lock-Konzept

Geplanter Lock-Scope:

```text
admin.users.note:{target_user_uid}
```

Beispiele:

```text
admin.users.note:tw:127709954
admin.users.note:tw:456192413
```

Regeln:

```text
Vor update/deactivate muss ein Lock vorhanden oder im Write-Ablauf sauber erworben werden.
Create darf ebenfalls denselben Scope nutzen, damit parallele Bearbeitungen sauber blockiert werden.
Lock-Ablauf muss Heartbeat/Timeout beruecksichtigen.
Force-Takeover bleibt Admin/Owner-Sonderfall und nicht Teil des ersten Write-Steps.
```

RDAP30 baut keine Lock-Write-Funktion. Es plant nur den Scope.

---

## 8. Audit-Konzept

Jede spaetere Schreibaktion muss einen Audit-Eintrag erzeugen.

Geplante Audit-Events:

```text
admin.user_note.create
admin.user_note.update
admin.user_note.deactivate
```

Pflichtfelder im Audit-Payload:

```text
actor_user_uid
target_user_uid
note_uid
action
old_status
new_status
old_text_hash_or_preview
new_text_hash_or_preview
confirm_write
lock_scope
request_id_or_trace_id
created_at / updated_at
```

Keine vollen sensiblen Notiztexte unnoetig im Audit speichern. Eine kurze Preview oder Hash ist sicherer.

---

## 9. API-Routen fuer spaeteren Implementierungsstep

Geplante Routen, noch nicht gebaut:

```text
POST  /api/remote/admin/users/admin-notes/create
POST  /api/remote/admin/users/admin-notes/update
POST  /api/remote/admin/users/admin-notes/deactivate
```

Alternativ REST-naeher:

```text
POST  /api/remote/admin/users/:targetUserUid/admin-notes
PATCH /api/remote/admin/users/:targetUserUid/admin-notes/:noteUid
POST  /api/remote/admin/users/:targetUserUid/admin-notes/:noteUid/deactivate
```

Empfehlung fuer das bestehende RDAP-Muster:

```text
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update
POST /api/remote/admin/users/admin-notes/deactivate
```

Warum: Die bisherigen RDAP-Routen sind bereits eher explizit-funktional als streng RESTful. Weniger Risiko fuer Frontend-/Routing-Bruch.

---

## 10. Request-Body Vorschlag

### Create

```json
{
  "targetUserUid": "tw:127709954",
  "noteText": "Interne Admin-Notiz",
  "actor": "dashboard"
}
```

### Update

```json
{
  "targetUserUid": "tw:127709954",
  "noteUid": "note_uid",
  "noteText": "Geaenderter Text",
  "actor": "dashboard"
}
```

### Deactivate

```json
{
  "targetUserUid": "tw:127709954",
  "noteUid": "note_uid",
  "actor": "dashboard"
}
```

---

## 11. Validierung

Pflichtvalidierung fuer spaetere Writes:

```text
Session gueltig
DashboardAccess true
remote.view erlaubt
admin.users.note.write erlaubt
targetUserUid vorhanden
target user existiert in dashboard_users
noteText bei create/update nicht leer
noteText Laenge begrenzen
noteUid bei update/deactivate vorhanden
Notiz gehoert zum targetUserUid
status aktiv bei update/deactivate
confirmWrite=true
Lock/Audit-Anforderung erfuellt
```

Empfohlene Textgrenze:

```text
min: 1 Zeichen nach trim
max: 5000 Zeichen
```

Keine HTML-Ausfuehrung. UI muss Text als Text rendern, nicht als HTML.

---

## 12. Read-Back Pflicht

Nach jedem spaeteren Write:

```text
DB-Write ausfuehren
betroffene Notiz erneut lesen
target summary erneut lesen
Response mit note/summary zurueckgeben
```

Response muss bestaetigen:

```text
writeExecuted: true
readBackOk: true
noteUid
targetUserUid
status
updatedAt
```

Ohne Read-Back gilt der Write als nicht sauber abgeschlossen.

---

## 13. Backup-/Rollback-Regel

Vor dem ersten produktiven Write-Step:

```text
mysqldump Backup der betroffenen Tabelle dashboard_user_admin_notes
Backup-Dateigroesse sichtbar pruefen
Rollback-Befehl dokumentieren
```

Bei spaeteren normalen Einzelwrites ist nicht vor jedem Klick ein voller Dump praktikabel. Fuer die erste Aktivierung/Implementierung aber Pflicht.

Rollback fuer den Test-/Implementierungsstep:

```text
deaktivierte/geaenderte Testnotizen anhand note_uid zuruecksetzen
oder Tabelle aus Dump wiederherstellen, falls wirklich noetig
```

Backups duerfen nicht ins Repo.

---

## 14. UI-Plan

Schreibbuttons erst in einem spaeteren UI-Step sichtbar machen, wenn Backend-Write sicher ist.

Spaeter sichtbare Aktionen:

```text
Neue Notiz
Bearbeiten
Deaktivieren
```

Nicht anzeigen:

```text
Loeschen
Bulk delete
Rechte/Rollen aendern
```

UI-Regel:

```text
Buttons nur anzeigen, wenn canWriteAdminNotes true ist.
Wenn write false: read-only Hinweis beibehalten.
```

---

## 15. Empfohlene naechste Steps

### RDAP31_ADMIN_NOTE_WRITE_BACKEND_CREATE_UPDATE_DEACTIVATE_DISABLED_UI

Backend-Write-Routen bauen, aber UI-Schreibbuttons weiterhin deaktiviert/nicht sichtbar. Test nur per Curl mit `confirmWrite=true`.

Muss enthalten:

```text
Permissioncheck admin.users.note.write
Confirm-Write
Audit-Pflicht vorbereitet oder aktiv, je nach vorhandener Audit-Write-Basis
Lock-Scope eingebunden oder hart blockiert, falls Lock-Write noch nicht aktiv ist
Read-Back
Keine UI-Schreibbuttons
```

### RDAP32_ADMIN_NOTE_WRITE_PERMISSION_OWNER_SEED

Owner bekommt gezielt `admin.users.note.write`, falls RDAP31 Backend sicher getestet ist.

### RDAP33_ADMIN_NOTE_WRITE_UI_GATED_BUTTONS

UI-Schreibbuttons gated anzeigen, nur wenn `canWriteAdminNotes === true`.

---

## 16. Entscheidung fuer ForrestCGN

Empfehlung:

```text
Als ersten echten Write-Umfang nur create/update/deactivate bauen.
Kein physisches Delete.
UI-Schreibbuttons erst nach erfolgreichem Backend-Test aktivieren.
```

RDAP30 ist damit abgeschlossen, wenn Forrest diesen Plan akzeptiert.
