# NEXT STEPS - stream-control-center

Stand: RDAP_USERMENU2_CLEAN_PROFILE_ACTIONS_AND_DOCS
Datum: 2026-06-24

## Sofort

1. `RDAP_USERMENU2_CLEAN_PROFILE_ACTIONS_AND_DOCS.zip` lokal einspielen.
2. Prüfen, dass im Profilpanel nur noch `Profil aktualisieren` und `Ausloggen` sichtbar sind.
3. `stepdone.cmd` ausführen.
4. Danach Webserver-Deploy.
5. Browser-Test auf `https://mods.forrestcgn.de/`.

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

### 2. Admin User Management planen

Nächster Planungs-Step:

```text
RDAP_ADMIN_USERS2_MANAGEMENT_PLAN
```

Scope nur Planung/Design, bevor Writes gebaut werden:

- Welche Rollen dürfen User verwalten?
- Welche Aktionen brauchen Owner-only?
- Welche Aktionen darf ein Admin?
- Wie wird `Sound-Profi` gesetzt/entfernt?
- Welche Confirm-Write-Mechanik?
- Welche Audit-Felder?
- Welche Locking-Regeln?
- Wie wird Rollback/Backup umgesetzt?

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
