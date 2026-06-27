# RDAP26_PERMISSION_DB_SEED_OPTION_B

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard  
Entscheidung: Option B - echte Rollen und Permissions in der DB

---

## 1. Entscheidung

Forrest hat entschieden:

```text
Option B bitte, direkt richtig.
```

Damit gilt:

```text
Keine Admin-Rechte aus Allowlist-Abkuerzung.
Dashboard-Zugang darf weiter ueber Allowlist funktionieren.
Kritische Rechte kommen aus DB-Rollen/Permissions.
```

---

## 2. Warum Option B

RDAP25 hat gezeigt:

```text
Login funktioniert.
Session funktioniert.
DashboardAccess funktioniert ueber allowed_login.
Permission-Kontext wird gelesen.
Aber:
  roles: []
  rolePermissions: 0
  modulePermissions: 0
  effectivePermissionWouldAllow: false
  effectivePermissionReason: no_matching_permission
```

Das bedeutet:

```text
ForrestCGN ist eingeloggt, aber hat noch keine echte DB-Rolle/Permission.
```

Option B loest das sauber:

```text
ForrestCGN -> Rolle owner
Rolle owner -> remote.view
Rolle owner -> admin.users.note.read
```

---

## 3. Code-Basis

Der aktuelle Permission-Code liest:

```text
dashboard_user_roles:
  user_uid
  role_key
  revoked_at

dashboard_role_permissions:
  role_key
  permission_key
  effect

dashboard_module_permissions:
  subject_type
  subject_key
  permission_key
  target_type
  target_key
  effect
```

Fuer den ersten Owner-Seed reicht:

```text
dashboard_user_roles
dashboard_role_permissions
```

---

## 4. Ziel dieses Steps

RDAP26 bereitet den DB-Seed fuer Option B vor.

Enthalten:

```text
tools/rdap26_owner_permission_seed_option_b.sql
```

Der SQL-Seed soll:

```text
ForrestCGN/tw:127709954 die Rolle owner geben
owner -> remote.view erlauben
owner -> admin.users.note.read erlauben
```

---

## 5. Harte Grenzen

Dieser Step macht nicht:

```text
Kein Admin-Notiz-Write
Keine Admin-Notiz-Erstellung
Keine Admin-Notiz-Aenderung
Keine Admin-Notiz-Loeschung
Keine UI-Schreibbuttons
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
Keine Rolle fuer EngelCGN ohne separaten Entscheid
Keine Permission admin.users.note.write
```

---

## 6. Vor Ausfuehrung auf dem Webserver

Backup erstellen:

```bash
mkdir -p /opt/stream-control-center/_runtime_tmp/rdap_db_backups

mysqldump --single-transaction --routines --triggers c3stream_control \
  > "/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap26_before_owner_permission_seed_$(date +%Y%m%d_%H%M%S).sql"

ls -lh /opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap26_before_owner_permission_seed_*.sql
```

Falls `mysqldump` ohne Zugangsdaten nicht funktioniert, die gleiche sichere DB-Methode wie bei RDAP16 verwenden. Keine Passwoerter im Chat posten.

---

## 7. Precheck: Tabellen/Spalten pruefen

Im Deploy-Clone oder direkt per MySQL:

```sql
SELECT TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
    'dashboard_users',
    'dashboard_user_roles',
    'dashboard_role_permissions',
    'dashboard_module_permissions'
  )
ORDER BY TABLE_NAME, ORDINAL_POSITION;
```

Mindest-Erwartung:

```text
dashboard_users.user_uid
dashboard_users.login_name
dashboard_user_roles.user_uid
dashboard_user_roles.role_key
dashboard_user_roles.revoked_at
dashboard_role_permissions.role_key
dashboard_role_permissions.permission_key
dashboard_role_permissions.effect
```

---

## 8. SQL ausfuehren

SQL-Datei:

```text
tools/rdap26_owner_permission_seed_option_b.sql
```

Aus dem frischen Webserver-Deploy-Clone:

```bash
cd /opt/stream-control-center/_deploy_tmp/<RDAP26_STEP_NAME>

mysql c3stream_control < tools/rdap26_owner_permission_seed_option_b.sql
```

Falls MySQL-Zugang anders erfolgt, die sichere DB-Methode aus RDAP16 nutzen.

---

## 9. Read-back nach SQL

```sql
SELECT user_uid, display_name, login_name, status
FROM dashboard_users
WHERE user_uid = 'tw:127709954'
LIMIT 1;

SELECT role_key
FROM dashboard_user_roles
WHERE user_uid = 'tw:127709954'
  AND revoked_at IS NULL
ORDER BY role_key;

SELECT role_key, permission_key, effect
FROM dashboard_role_permissions
WHERE role_key = 'owner'
  AND permission_key IN ('remote.view', 'admin.users.note.read')
ORDER BY permission_key, effect;
```

Erwartung:

```text
dashboard_user_roles:
  owner

dashboard_role_permissions:
  owner admin.users.note.read allow
  owner remote.view allow
```

---

## 10. Browser-/API-Test danach

Im eingeloggten Browser erneut testen:

```text
https://mods.forrestcgn.de/api/remote/auth/permissions/check?permission=remote.view
https://mods.forrestcgn.de/api/remote/auth/permissions/check?permission=admin.users.note.read
```

Erwartung:

```text
permission.requested: remote.view
diagnostics.contextLookupPerformed: true
diagnostics.permissionEvaluationPerformed: true
diagnostics.effectivePermissionWouldAllow: true
diagnostics.effectivePermissionReason: explicit_allow
diagnostics.roles enthaelt owner
diagnostics.permissionRows.rolePermissions > 0
```

und fuer `admin.users.note.read` entsprechend ebenfalls `true`.

Wichtig:

```text
allowed kann im alten RDAP8A-Diagnostic-Endpunkt weiterhin false bleiben.
Fuer diesen Test zaehlt diagnostics.effectivePermissionWouldAllow.
```

---

## 11. Naechster Step nach erfolgreichem Seed

Nach erfolgreichem Test:

```text
RDAP26B_OWNER_PERMISSION_SEED_LIVE_CONFIRMED_DOCS
```

Danach:

```text
RDAP27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
```

RDAP27 darf echte Admin-Notiztexte nur dann liefern, wenn serverseitig gilt:

```text
gueltige Session
Dashboard-Zugriff erlaubt
admin.users.note.read effectivePermissionWouldAllow true
Community-Seiten ausgeschlossen
```
