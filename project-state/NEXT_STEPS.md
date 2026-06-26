# NEXT_STEPS

Stand: RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP51 Webserver-Deploy und Live-Bestaetigung
```

## Deploy-Standard

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED
cd RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED dev
```

## Tests nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/assets/rdap28-admin-notes.js | grep -n "adminNotesBridgeContext\|openNotesForUser\|returnToAdminUserDetailFromNotes\|TARGET_USER_UID"
curl -s -o /dev/null -w "twitch/start HTTP %{http_code}
" https://mods.forrestcgn.de/api/remote/auth/twitch/start
curl -s -o /dev/null -w "twitch/callback HTTP %{http_code}
" https://mods.forrestcgn.de/api/remote/auth/twitch/callback
```

## Browser-Test

```text
Admin -> User-Detail sichtbar.
Button Admin-Notizen oeffnen setzt denselben User.
Admin-Notizen zeigt Kontext-Hinweis Aus User-Detail geoeffnet.
Ruecksprung Zurueck zum User-Detail funktioniert.
Hinweis ausblenden funktioniert.
Read/Create bleiben unveraendert.
```

## Danach

```text
RDAP51B_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_LIVE_CONFIRMED_DOCS
```
