# NEXT_STEPS

Stand: RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP45B Webserver-Deploy und Live-Bestaetigung
```

## Ziel

```text
Der vorbereitete RDAP45B-Deploy-Safety-Fix muss live bestaetigt werden.
```

## Erwartung nach Deploy

```text
/api/remote/auth/twitch/start    -> 302, wenn Login bewusst aktiv/freigegeben ist
/api/remote/auth/twitch/start    -> 403, wenn Login gesperrt ist
/api/remote/auth/twitch/callback -> 403 ohne gueltigen OAuth-State
remote-modboard-deploy.sh laeuft in beiden legitimen Start-Zustaenden ohne OAuth-Safety-Fehler durch.
```

## Deploy-Standard

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED
cd RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED dev
```

## Tests nach Deploy

```bash
curl -s -o /dev/null -w "twitch/start HTTP %{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/start
curl -s -o /dev/null -w "twitch/callback HTTP %{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/callback
curl -fsS http://127.0.0.1:3010/assets/rdap28-admin-notes.js | grep -n "adminNotesTargetSelect\|DEFAULT_TARGET_USER" | head
```

## Browser-Test

```text
https://mods.forrestcgn.de/
Login-Button funktioniert weiter.
Admin -> Admin-Notizen zeigt Zieluser-Auswahl weiter an.
```

## Nicht in diesem Step aendern

```text
Keine Admin-Notizen-UI-Aenderung.
Keine DB-Migration.
Keine Permission-Verwaltung.
Keine neuen produktiven Admin-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Danach

Wenn live bestaetigt:

```text
RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS
```
