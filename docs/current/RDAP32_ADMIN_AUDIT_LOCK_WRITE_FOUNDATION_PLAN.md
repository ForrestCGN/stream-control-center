# RDAP32_ADMIN_AUDIT_LOCK_WRITE_FOUNDATION_PLAN

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Planungs-/Scope-Step, **keine Backend-/UI-/DB-Aenderung**

---

## 1. Zweck

RDAP32 plant die echte Audit-/Lock-Write-Foundation fuer spaetere Admin-Notiz-Writes.

Dieser Step baut bewusst noch keine produktiven Writes.

Grund:

```text
RDAP31 hat Admin-Notiz-Write-Routen als gesperrte Validierungsrouten live gebracht.
Diese Routen duerfen erst produktiv schreiben, wenn Audit und Lock wirklich funktionieren.
```

RDAP32 legt fest, was vor produktiven Admin-Notiz-Writes zwingend gebaut werden muss.

---

## 2. Ausgangsstand nach RDAP31B

Live bestaetigt:

```text
RDAP31-Routen sind registriert.
Ohne Confirm -> HTTP 400 confirm_write_required.
Mit Body-Confirm ohne Session -> HTTP 401 not_logged_in_or_session_invalid.
DB note_count bleibt 1.
Keine neue Notiz geschrieben.
```

RDAP31B-Befund:

```text
confirmWrite im JSON-Body funktioniert.
confirmWrite=true per Query wurde nicht erkannt.
```

Weiterhin blockiert:

```text
admin.users.note.write Permission
produktive Admin-Notiz-Writes
UI-Schreibbuttons
Audit-Inserts
Lock-Writes
physisches DELETE
Community-Seiten-Anbindung
User-/Rollen-/Session-Writes
Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

---

## 3. Gepruefte Foundation-Dateien

Vor RDAP32 wurden diese echten GitHub/dev-Dateien als Grundlage beruecksichtigt:

```text
remote-modboard/backend/src/services/admin-audit-write.service.js
remote-modboard/backend/src/services/admin-lock-write.service.js
remote-modboard/backend/src/services/admin-confirm-write.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/audit-read.service.js
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
docs/current/RDAP31B_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI_LIVE_CONFIRMED_DOCS.md
```

Aktueller Befund:

```text
Audit-Write-Helper ist aktuell Draft-/Validierungshelper und schreibt nicht.
Lock-Write-Helper ist aktuell Draft-/Validierungshelper und schreibt nicht.
DB-Service kann grundsaetzlich Write-Connections zulassen, aber Safety/Scope muessen separat kontrolliert werden.
RDAP31-Routen blockieren korrekt, solange Audit/Lock-Writes deaktiviert sind.
```

---

## 4. Ziel fuer spaeteren Build-Step

Spaeterer Build-Step soll echte Foundation-Routen/Services schaffen fuer:

```text
Audit-Insert
Lock acquire
Lock heartbeat
Lock release
Lock force-takeover
Lock stale cleanup / timeout handling
```

Aber: RDAP32 selbst baut das noch nicht.

---

## 5. Audit-Write-Zielbild

### Tabelle

Bestehende bzw. geplante Tabelle:

```text
dashboard_audit_log
```

Vor echtem Build muss Live-Schema geprueft werden:

```sql
SHOW COLUMNS FROM dashboard_audit_log;
SELECT COUNT(*) AS audit_count FROM dashboard_audit_log;
```

### Audit-Events fuer Admin-Notizen

Pflicht-Events fuer spaetere Admin-Notiz-Writes:

```text
admin.user_note.create
admin.user_note.update
admin.user_note.deactivate
```

Weitere Audit-Events fuer Lock-Operationen:

```text
admin.lock.acquire
admin.lock.heartbeat
admin.lock.release
admin.lock.force_takeover
admin.lock.expire
```

### Pflichtfelder

Audit muss mindestens speichern koennen:

```text
actor_user_uid
actor_login
action
resource_type
resource_key
status
reason
metadata_json / safe_metadata_json
created_at
request_id / trace_id, falls vorhanden
```

Falls die Tabelle andere Spalten nutzt, muss der Build-Step die vorhandene Struktur verwenden, nicht neue Parallelspalten erfinden.

### Keine Secrets

Audit darf niemals speichern:

```text
oauth_code
access_token
refresh_token
token
cookie
session_id
password
secret
client_secret
env
rawBody
rawPayload
```

Nur sichere Metadata verwenden.

---

## 6. Lock-Write-Zielbild

### Tabelle

Bestehende bzw. geplante Tabelle:

```text
dashboard_locks
```

Vor echtem Build muss Live-Schema geprueft werden:

```sql
SHOW COLUMNS FROM dashboard_locks;
SELECT COUNT(*) AS lock_count FROM dashboard_locks;
```

### Lock-Scope fuer Admin-Notizen

```text
admin.users.note:{target_user_uid}
```

Beispiele:

```text
admin.users.note:tw:127709954
admin.users.note:tw:456192413
```

### Lock-Regeln

```text
Acquire nur mit gueltiger Session, DashboardAccess und passender Permission.
Heartbeat nur fuer eigenen aktiven Lock.
Release nur fuer eigenen aktiven Lock oder Admin/Owner-Fall.
Force-Takeover nur spaeter und nur mit eigener Permission/Owner-Regel.
Stale Locks muessen per expires_at/heartbeat timeout behandelbar sein.
```

### Minimaler erster Lock-Scope

Fuer Admin-Notiz-Writes reicht zunaechst:

```text
resource_type = admin_user_note
resource_key = admin.users.note:{target_user_uid}
```

Kein freier Lock fuer beliebige Ressourcen.

---

## 7. Confirm-Write Entscheidung

RDAP31B hat gezeigt:

```text
confirmWrite im JSON-Body funktioniert.
confirmWrite=true per Query wurde nicht erkannt.
```

RDAP32-Entscheidung:

```text
Fuer spaetere produktive Writes wird zunaechst nur Body-Confirm dokumentiert und verwendet.
Query-Confirm wird nicht als produktiver Standard genutzt, solange der Befund nicht geklaert ist.
```

Begruendung:

```text
Body-Confirm funktioniert live.
Query-Confirm ist fehleranfaellig im aktuellen Ablauf.
Strengeres Verhalten ist sicherer.
```

Spaeter kann ein separater Fix-Step den Confirm-Helper/Query-Pfad korrigieren.

---

## 8. API-Routen fuer spaetere Audit-/Lock-Foundation

Empfohlene Foundation-Routen:

```text
GET  /api/remote/admin/audit/write-foundation/status
POST /api/remote/admin/audit/test-insert-disabled-or-confirmed

GET  /api/remote/admin/locks/write-foundation/status
POST /api/remote/admin/locks/acquire
POST /api/remote/admin/locks/heartbeat
POST /api/remote/admin/locks/release
POST /api/remote/admin/locks/force-takeover
```

Empfehlung fuer ersten Build-Step:

```text
RDAP33 baut erst Foundation-Status + echte Tabellen-/Schema-Pruefung.
RDAP34 baut echte Audit-Insert-Route fuer kontrollierten Test.
RDAP35 baut echte Lock-Acquire/Heartbeat/Release fuer kontrollierten Test.
```

Alternative bei groesserem Step:

```text
RDAP33 baut Audit+Lock zusammen, aber nur wenn Schema vorher live bestaetigt wurde.
```

---

## 9. Permissions fuer spaetere Audit-/Lock-Foundation

Audit-/Lock-Writes duerfen nicht frei offen sein.

Empfohlene interne Voraussetzungen:

```text
remote.view
admin.users.note.write fuer Admin-Notiz-Writes
confirmWrite im Body
gueltige Session
DashboardAccess
```

Optional spaeter eigene Permissions:

```text
admin.audit.write
admin.lock.write
admin.lock.force_takeover
```

Fuer den ersten Admin-Notiz-Write kann Audit/Lock intern vom Admin-Notiz-Service genutzt werden, ohne eigene UI-Permissions fuer Audit/Lock anzuzeigen.

---

## 10. Backup-/Rollback-Regel

Vor jedem echten Foundation-DB-Write-Step:

```text
mysqldump der betroffenen Tabellen:
- dashboard_audit_log
- dashboard_locks
- dashboard_user_admin_notes, falls Admin-Notiz-Write im selben Step betroffen ist
```

Pflicht:

```text
Backup-Datei existiert
Backup-Datei ist nicht 0 Byte
Read-only Vorpruefung ausgefuehrt
Nach Write Read-Back ausgefuehrt
Rollback-Hinweis dokumentiert
```

Keine Backups ins Repo.

---

## 11. Fehler- und Abbruchfaelle

Foundation muss klar blocken bei:

```text
keine Session
DashboardAccess false
Permission fehlt
confirmWrite fehlt
DB nicht konfiguriert
Schema fehlt / Spalten fehlen
Audit-Draft unsicher
Lock bereits aktiv von anderer Session/User
Lock abgelaufen, aber nicht bereinigt
Read-Back fehlgeschlagen
```

Keine stillen Writes.

---

## 12. Naechster sinnvoller Step

Empfohlen:

```text
RDAP33_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY
```

Ziel:

```text
Read-only Routen fuer Audit-/Lock-Schema und Runtime-Status bauen.
Keine Writes.
Live Tabellen/Spalten sichtbar machen.
Entscheidung vorbereiten, ob RDAP34 echte Audit-/Lock-Testwrites bauen darf.
```

Warum zuerst read-only?

```text
Audit/Lock sind sicherheitskritisch.
Live-Schema muss exakt bekannt sein.
Keine neuen Parallelstrukturen bauen.
```

Danach:

```text
RDAP34_ADMIN_AUDIT_TEST_INSERT_CONFIRMED
RDAP35_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_CONFIRMED
RDAP36_ADMIN_NOTE_WRITE_REAL_CONFIRM_AUDIT_LOCK
RDAP37_ADMIN_NOTE_WRITE_UI_GATED_BUTTONS
```

---

## 13. RDAP32 Ergebnis

RDAP32 ist abgeschlossen, wenn dieser Plan in GitHub/dev dokumentiert ist.

RDAP32 selbst:

```text
keine Backend-Dateien
keine UI-Dateien
keine DB-Aenderung
kein Webserver-Deploy
```
