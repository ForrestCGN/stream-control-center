# NEXT STEPS - stream-control-center

Stand: RDAP_AUTH4_SELF_TWITCH_PROFILE_SYNC
Datum: 2026-06-24

## Sofort

1. Auth4-Doku-Finalisierung lokal einspielen.
2. `stepdone.cmd` für Doku ausführen.
3. Kein Webserver-Deploy nötig, da nur Doku.

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

### 2. Admin User Read-only Übersicht

Nächster geplanter Step:

```text
RDAP_ADMIN_USERS1_READONLY_OVERVIEW
```

Scope:

- Admin-Bereich bekommt User-/Rollenübersicht.
- Nur read-only.
- Anzeige vorhandener User, Rollen, Gruppen, Sessions.
- Keine Freigabe ändern.
- Keine Rollen schreiben.
- Keine User sperren/löschen.

### 3. Spätere Admin-Writes nur mit eigenem Scope

Für echte User-/Rollenverwaltung später nötig:

- serverseitige Owner/Admin-Permission-Middleware
- Confirm-Write
- Audit-Log
- Locking
- Backup/Rollback-Plan
- klare Trennung Self-Profil vs. Admin-Verwaltung

## Webserver-Deploy-Regel

Erst nach lokalem `installstep.cmd`, Tests und `stepdone.cmd`.

Auf dem Webserver immer frisch klonen:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Nicht verwenden:

```text
/opt/stream-control-center/tools/remote-modboard-deploy.sh
```

`/opt/stream-control-center` ist kein Git-Repository.
