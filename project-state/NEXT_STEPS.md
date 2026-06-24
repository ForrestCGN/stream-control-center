# NEXT_STEPS - stream-control-center

Stand: RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED  
Datum: 2026-06-24

## Aktuell erledigt

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
RDAP_ADMIN_USERS11B_DEPLOY_CONFIRMED_DOCS
RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED
```

## DESIGN2 Ergebnis

Login-Text und Button sind live geändert:

```text
Melde dich mit Twitch an und öffne dein Modboard.
Anmelden
```

Optik: noch nicht perfekt, aber für jetzt akzeptiert. Optionaler Feinschliff später.

## Workflow-Notiz

`installstep.cmd` wurde geprüft und ist wieder der allgemeine ZIP-Installer. Für weitere Chats/Steps gilt zwingend:

```text
Keine Workflow-Tools in Design-/Frontend-Steps überschreiben.
installstep.cmd, stepdone.cmd, testdeploy.cmd und Deploy-Skripte zuerst prüfen und nur ändern, wenn Forrest es ausdrücklich beauftragt.
```

## Offene Auffälligkeit

Statusroute zeigte nach DESIGN2:

```text
moduleBuild: RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
statusApiVersion: rdap_admin_users9.v1
```

Das ist kein DESIGN2-Stopper, sollte aber später separat geprüft werden.

## Nächster empfohlener Fach-Step

```text
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
```

Scope nur Planung:

- Kleinsten möglichen späteren Admin-Write auswählen.
- Noch keinen produktiven Write bauen.
- Noch keine UI-Schreibbuttons.
- Noch keine DB-Migration ohne Backup/Rollback/Go.
- Exakten Datenpfad klären: Welche Tabelle, welcher Datensatz, welches Feld.
- Backup- und Rollback-Befehl konkret dokumentieren.
- Permission-Grenze definieren.
- Confirm-Write-Anforderung definieren.
- Audit-Payload definieren.
- Lock-Scope definieren.
- Read-Back-Prüfung definieren.
- Fehlerfälle und Abbruchbedingungen dokumentieren.

## Geparkter optionaler UI-Feinschliff

```text
RDAP_DESIGN3_LOGIN_TEXT_LAYOUT_FINE_TUNE
```

Nur falls gewünscht:

- Login-Textblock optisch ruhiger machen.
- Umbruch/Zeilenlänge feiner einstellen.
- Keine Backend-/OAuth-/DB-/Write-Änderungen.

## Erst nach RDAP12

Ein echter Mini-Write darf erst separat gebaut werden, wenn RDAP12 abgeschlossen ist und Forrest ein weiteres klares `go` gibt.

## Webserver-Deploy-Regel

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen.

Immer frischer Clone in `_deploy_tmp`:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Nach Service-Restart immer Readiness abwarten:

```bash
sudo systemctl restart scc-remote-modboard.service

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```
