# NEXT_STEPS

Stand: RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_PREPARED  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP45 Webserver-Deploy und Live-Bestaetigung
```

## Ziel

```text
Der vorbereitete RDAP45-Safety-Fix muss live bestaetigt werden.
```

## Erwartung nach Deploy

```text
/api/remote/auth/twitch/start    -> 403
/api/remote/auth/twitch/callback -> 403
remote-modboard-deploy.sh laeuft ohne OAuth-Safety-Fehler durch.
```

## Deploy-Standard

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_PREPARED
cd RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_PREPARED dev
```

## Tests nach Deploy

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/start
curl -s -o /dev/null -w "%{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/callback
curl -fsS http://127.0.0.1:3010/assets/rdap28-admin-notes.js | grep -n "adminNotesTargetSelect\|DEFAULT_TARGET_USER" | head
```

## Nicht in diesem Follow-up aendern

```text
Keine Admin-Notizen-UI-Aenderung.
Keine DB-Migration.
Keine Permission-Verwaltung.
Keine neuen produktiven Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Danach

Wenn live bestaetigt:

```text
RDAP45B_REMOTE_AUTH_TWITCH_START_SAFETY_LIVE_CONFIRMED_DOCS
```
