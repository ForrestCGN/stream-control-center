# RDAP26B_OWNER_PERMISSION_SEED_LIVE_CONFIRMED_DOCS

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard  
Typ: Doku-/Status-Sync nach live bestaetigtem Owner-Permission-Seed

---

## 1. Zweck

RDAP26B dokumentiert den live bestaetigten Stand nach:

```text
RDAP_ADMIN_USERS26_PERMISSION_DB_SEED_OPTION_B
```

Forrest hat fuer die Rechteverwaltung Option B entschieden:

```text
Echte Rollen und Permissions in der DB.
Keine Allowlist-Abkuerzung fuer Admin-Rechte.
```

---

## 2. RDAP26 live ausgefuehrt und bestaetigt

Backup vor SQL-Seed:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap26_before_owner_permission_seed_20260625_080740.sql
```

Precheck Tabellen/Spalten erfolgreich:

```text
dashboard_users:
  user_uid
  display_name
  login_name
  profile_image_url
  status
  ...

dashboard_user_roles:
  user_uid
  role_key
  granted_by
  granted_at
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

SQL-Seed erfolgreich:

```text
ForrestCGN / tw:127709954 -> Rolle owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
```

Read-back erfolgreich:

```text
dashboard_users:
  tw:127709954 | ForrestCGN | forrestcgn | active

dashboard_user_roles:
  owner

dashboard_role_permissions:
  owner | admin.users.note.read | allow
  owner | remote.view           | allow
```

---

## 3. Browser-/API-Test erfolgreich

Im eingeloggten Browser wurden beide Permission-Diagnosen geprueft.

### remote.view

```text
permission.requested: remote.view
diagnostics.contextLookupPerformed: true
diagnostics.permissionEvaluationPerformed: true
diagnostics.effectivePermissionWouldAllow: true
diagnostics.effectivePermissionReason: explicit_allow
diagnostics.effectivePermissionEffect: allow
diagnostics.matchedAllowCount: 1
diagnostics.matchedDenyCount: 0
diagnostics.roles: ["owner"]
diagnostics.permissionRows.rolePermissions: 1
diagnostics.permissionRows.modulePermissions: 0
```

### admin.users.note.read

```text
permission.requested: admin.users.note.read
diagnostics.contextLookupPerformed: true
diagnostics.permissionEvaluationPerformed: true
diagnostics.effectivePermissionWouldAllow: true
diagnostics.effectivePermissionReason: explicit_allow
diagnostics.effectivePermissionEffect: allow
diagnostics.matchedAllowCount: 1
diagnostics.matchedDenyCount: 0
diagnostics.roles: ["owner"]
diagnostics.permissionRows.rolePermissions: 1
diagnostics.permissionRows.modulePermissions: 0
```

Wichtig:

```text
allowed: false im alten RDAP8A-Diagnose-Endpunkt ist aktuell kein Fehler.
Der Endpunkt meldet weiterhin auth_disabled_readonly_permission_denied.
Fuer die RDAP26-Bewertung zaehlt diagnostics.effectivePermissionWouldAllow: true.
```

---

## 4. Aktueller Rechte-Stand

Sauberer Stand nach Option B:

```text
ForrestCGN -> echte DB-Rolle owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
```

Damit ist Admin-Notiz-Lesen fachlich vorbereitet, aber noch nicht als echte Notiztext-Route gebaut.

---

## 5. Weiterhin nicht aktiv

```text
Admin-Notiztexte produktiv anzeigen
Admin-Notiz schreiben
Admin-Notiz aendern
Admin-Notiz loeschen
Permission admin.users.note.write
UI-Schreibbuttons
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
```

---

## 6. Naechster sinnvoller Fachstep

Naechster Fachstep:

```text
RDAP27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
```

RDAP27 darf erstmals echte Admin-Notiztexte liefern, aber nur read-only und nur wenn serverseitig gilt:

```text
gueltige Session
Dashboard-Zugriff erlaubt
admin.users.note.read effectivePermissionWouldAllow true
Community-Seiten ausgeschlossen
keine Write-Funktion
keine UI-Schreibbuttons
```

---

## 7. Kein Webserver-Deploy fuer RDAP26B

RDAP26B ist reine Dokumentation.

Keine Backend-Dateien geaendert.  
Keine DB-Aenderung in diesem Doku-Step.  
Keine Env-Aenderung.  
Kein Service-Restart noetig.  
Kein Webserver-Deploy noetig.
