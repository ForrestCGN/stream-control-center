# RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: SQL-/Doku-Step fuer read-only Validierung  
Status: Live validiert, nach RDAP29B korrigiert

---

## 1. Zweck

RDAP29 legt eine kontrollierte Test-Admin-Notiz fuer ForrestCGN an, damit die bereits live bestaetigte read-only Admin-Notiz-UI echten Inhalt anzeigen kann.

Zieluser:

```text
tw:127709954 / ForrestCGN / forrestcgn
```

Echte Live-Tabelle:

```text
dashboard_user_admin_notes
```

---

## 2. Wichtige Korrektur nach Live-Pruefung

Beim Live-Check wurde bestaetigt:

```text
Live-DB: MariaDB 11.8.6
DB: c3stream_control
Tabelle: dashboard_user_admin_notes
```

Nicht korrekt fuer den Live-Stand:

```text
SQLite
admin_user_notes
```

Der urspruenglich vorbereitete Seed darf nicht als SQLite-Seed gegen den Webserver interpretiert werden. Fuer Live wurde ein kontrollierter MariaDB-Insert gegen `dashboard_user_admin_notes` ausgefuehrt.

---

## 3. Sicherheitsgrenzen

RDAP29 ist keine Admin-Notiz-Schreibfunktion im Dashboard.

Nicht geaendert und weiterhin nicht aktiv:

```text
Keine UI-Schreibbuttons
Keine Write-Route
Keine Permission admin.users.note.write
Keine User-Freigabe/Sperrung
Keine Rollenvergabe
Keine Gruppen-/Freigaben-Aenderung
Keine Session-Revoke-Funktion
Keine Audit-Inserts ueber das Dashboard
Keine Lock acquire/heartbeat/release/force-takeover-Funktion
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
Keine Community-Seiten-Anbindung fuer Admin-Notizen
Keine Workflow-Tool-Aenderung
```

---

## 4. Lokales Einspielen

ZIP im lokalen Repo einspielen:

```powershell
cd D:\Git\stream-control-center

.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION.zip" "RDAP29 Admin-Notiz Test-Seed read-only Validierung vorbereitet"
```

Lokale Checks:

```powershell
cd D:\Git\stream-control-center

git status --short
git diff --stat
git diff -- tools/rdap29_admin_note_test_seed_readonly_validation.sql
git diff -- docs/current/RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION.md
git diff -- project-state/CURRENT_STATUS.md project-state/NEXT_STEPS.md project-state/TODO.md project-state/FILES.md project-state/CHANGELOG.md
```

Wenn lokal sauber:

```powershell
cd D:\Git\stream-control-center

.\stepdone.cmd "RDAP29 Admin-Notiz Test-Seed read-only Validierung vorbereitet; keine UI-Writes, keine Write-Permission, keine Backend-Aenderung"
```

---

## 5. Webserver-Hinweis

RDAP29 aendert keine Dateien unter:

```text
remote-modboard/
```

Darum ist fuer diesen ZIP-Step kein normaler Remote-Modboard-Service-Deploy noetig.

Wichtig: Die SQL-/Doku-Dateien liegen im Repo und werden nicht automatisch auf die Live-App deployed. Fuer Server-Pruefungen wurde ein frischer GitHub/dev-Clone unter `_deploy_tmp` genutzt.

---

## 6. Live-DB-Befund

Bestaetigte DB-Umgebung:

```text
EnvironmentFile: /etc/stream-control-center/remote-modboard.env
DB_HOST: localhost
DB_PORT: 3306
DB_NAME: c3stream_control
DB_USER: c1stream_control
DB_ENGINE: MariaDB 11.8.6
```

Secrets bleiben maskiert und duerfen nicht ins Repo.

Bestaetigte Tabelle:

```text
dashboard_user_admin_notes
```

Schema:

```text
id
note_uid
target_user_uid
note_text
status
created_by_user_uid
updated_by_user_uid
created_at
updated_at
```

Vor Seed:

```text
note_count = 0
```

---

## 7. Live-Seed

Ausgefuehrter kontrollierter MariaDB-Insert:

```text
note_uid: rdap29-test-note-forrestcgn-readonly-validation
target_user_uid: tw:127709954
status: active
created_by_user_uid: tw:127709954
updated_by_user_uid: tw:127709954
```

Notiztext:

```text
RDAP29 Test-Notiz: Diese Notiz wurde kontrolliert per MariaDB-Seed angelegt, damit die read-only Admin-Notiz-UI echten Inhalt anzeigen kann. Keine UI-Schreibfunktion, keine Write-Permission, keine produktiven Schreibbuttons.
```

Nach Seed:

```text
note_count = 1
```

---

## 8. Browser-Pruefung

Browser mit gueltiger Session:

```text
https://mods.forrestcgn.de/
Admin -> Admin-Notizen
```

Bestaetigt:

```text
ForrestCGN / tw:127709954
1 Admin-Notiz(en) read-only geladen.
Test-Notiz sichtbar
Write false
Keine Schreibbuttons sichtbar
```

---

## 9. Naechster sinnvoller Schritt danach

Nach erfolgreicher RDAP29-Validierung:

```text
RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN
```

Ziel: Write-Scope sauber planen, aber noch nicht direkt bauen.

Der spaetere Write-Step braucht separat:

```text
Permission admin.users.note.write
Confirm-Write Pflicht
Audit-Konzept
Lock-Scope
Backup-/Rollback-Konzept
Read-Back-Pruefung
Fehler-/Abbruchfaelle
separates Go von Forrest
```
