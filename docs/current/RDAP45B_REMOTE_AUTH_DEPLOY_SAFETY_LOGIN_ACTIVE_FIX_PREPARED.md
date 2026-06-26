# RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Backend-Deploy-Script-/Doku-Step

## Ausgangslage

RDAP44 ist live funktional bestaetigt: Admin-Notizen haben eine Zieluser-Auswahl, Default ist ForrestCGN / `tw:127709954`, Read/Create nutzen den ausgewaehlten Zieluser.

Beim RDAP44/RDAP45 Deploy wurde ein OAuth-Safety-Befund sichtbar:

```text
twitch/start HTTP 302
twitch/callback HTTP 403
Deploy-Script erwartete 403/403.
```

RDAP45 setzte daraufhin ein explizites Gate:

```text
RDAP_TWITCH_OAUTH_START_RELEASED=true
```

Live zeigte danach aber: Der Dashboard-Login nutzt den Twitch-OAuth-Start bereits produktiv. Ohne Freigabe landet der Login-Button auf der 403-JSON-Fehlerseite. Nach Setzen von `RDAP_TWITCH_OAUTH_START_RELEASED=true` funktioniert der Login wieder und `twitch/start` liefert korrekt HTTP `302`.

## Entscheidung RDAP45B

Der Deploy-Safety-Check war zu hart. Er hat aktiven Login faelschlich als Safety-Verletzung bewertet.

Korrekte Semantik:

```text
/api/remote/auth/twitch/start -> 302 ist erlaubt, wenn Login/OAuth-Start bewusst aktiv/freigegeben ist.
/api/remote/auth/twitch/start -> 403 ist erlaubt, wenn Login/OAuth-Start gesperrt ist.
/api/remote/auth/twitch/callback -> 403 ohne gueltigen OAuth-State bleibt Pflicht.
```

Wichtig:

```text
Aktiver Login/OAuth-Session-Scope ist nicht gleich Remote-Writes.
Remote-Writes, Agent-Actions, OBS/Sound/Overlay/Commands bleiben weiterhin gesperrt.
```

## Geaendert

```text
tools/remote-modboard-deploy.sh
```

Der OAuth/Login-Safety-Block wurde angepasst:

```text
START_CODE 302 -> ok, Login/OAuth-Start bewusst aktiv.
START_CODE 403 -> ok, Login/OAuth-Start gesperrt.
START_CODE alles andere -> Fehler.
CALLBACK_CODE muss weiter 403 sein.
```

## Nicht geaendert

```text
Keine Admin-Notizen-UI-Aenderung.
Keine Admin-Note Update-Funktion.
Keine Admin-Note Deactivate-Funktion.
Kein Delete.
Keine Permission-Verwaltung.
Keine DB-Migration.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freien Shell-/Datei-/Prozess-/URL-Actions.
Keine neuen produktiven Admin-Writes.
```

## Gepruefte Dateien

```text
remote-modboard/backend/src/services/auth-twitch-oauth.service.js
remote-modboard/backend/src/services/auth-login-entry.service.js
remote-modboard/backend/src/routes/auth-login.routes.js
tools/remote-modboard-deploy.sh
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Erwartete Tests

Lokal:

```powershell
cd D:\Git\stream-control-center
bash -n tools/remote-modboard-deploy.sh
```

Falls lokal kein Bash verfuegbar ist, erfolgt die Shell-Pruefung beim Webserver-Deploy durch den Scriptlauf selbst.

Webserver-Deploy:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED
cd RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED dev
```

Nach Deploy:

```bash
curl -s -o /dev/null -w "twitch/start HTTP %{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/start
curl -s -o /dev/null -w "twitch/callback HTTP %{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/callback
curl -fsS http://127.0.0.1:3010/assets/rdap28-admin-notes.js | grep -n "adminNotesTargetSelect\|DEFAULT_TARGET_USER" | head
```

Browser:

```text
https://mods.forrestcgn.de/
Login-Button funktioniert.
Admin -> Admin-Notizen zeigt Zieluser-Auswahl weiter an.
```

## Naechster Schritt nach Live-Bestaetigung

```text
RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS
```
