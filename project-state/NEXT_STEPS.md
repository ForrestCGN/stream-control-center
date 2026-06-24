# NEXT STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC
Datum: 2026-06-24

## Sofort

1. `RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC.zip` lokal einspielen.
2. Lokalen Service/Remote-Modboard falls noetig neu starten.
3. Route pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:3010/api/remote/admin/users/permission-diagnostic" |
  ConvertTo-Json -Depth 10
```

Ohne Browser-Session im PowerShell-Kontext ist `401` erwartbar.

4. `git status` pruefen.
5. Wenn sauber: `stepdone.cmd` ausfuehren.
6. Danach Webserver-Deploy aus GitHub/dev.
7. Remote pruefen:

```text
https://mods.forrestcgn.de/api/remote/admin/users/permission-diagnostic
```

## Danach empfohlen

### 1. Secrets rotieren

Falls noch nicht erledigt:

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

Danach Login erneut testen.

### 2. Confirm-/Audit-/Locking-Foundation planen/bauen

Naechster Step:

```text
RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION
```

Scope weiterhin klein:

- Confirm-Write-Helfer vorbereiten,
- Audit-Write-Ziel technisch pruefen,
- Locking-Foundation pruefen,
- keine grossen User-/Rollen-Writes,
- keine UI-Schreibbuttons ohne eigenen Step.

### 3. Spätere Admin-Writes nur mit eigenem Scope

Fuer echte User-/Rollenverwaltung spaeter noetig:

- serverseitige Owner/Admin-Permission-Middleware,
- Confirm-Write,
- Audit-Log,
- Locking,
- Backup/Rollback-Plan,
- klare Trennung Self-Profil vs. Admin-Verwaltung.

## Webserver-Deploy-Regel

Erst nach lokalem `installstep.cmd`, Tests und `stepdone.cmd`.

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen.
