# NEXT_STEPS

Stand: RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP49 Webserver-Deploy und Live-Bestaetigung
```

## Ziel

```text
Die vorbereitete Admin-User-Detailseite read-only live bestaetigen.
```

## Deploy-Standard

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED
cd RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED dev
```

## Tests nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/assets/rdap28-admin-notes.js | grep -n "admin-user-detail\|Admin-User-Detail\|openUserDetail"
curl -s -o /dev/null -w "twitch/start HTTP %{http_code}
" https://mods.forrestcgn.de/api/remote/auth/twitch/start
curl -s -o /dev/null -w "twitch/callback HTTP %{http_code}
" https://mods.forrestcgn.de/api/remote/auth/twitch/callback
```

## Browser-Test

```text
Admin -> User-Detail sichtbar.
ForrestCGN / tw:127709954 sichtbar.
Rollen/Gruppen/Sessions read-only sichtbar, soweit Daten vorhanden.
Button Admin-Notizen oeffnen setzt denselben User in Admin-Notizen.
Admin-Notizen Read/Create bleiben unveraendert.
```

## Nicht in diesem Step aendern

```text
Keine Backend-Aenderung.
Keine DB-Migration.
Keine Permission-Verwaltung.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein Delete.
Keine Community-Read-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Danach

```text
RDAP49B_ADMIN_USER_DETAIL_READONLY_LIVE_CONFIRMED_DOCS
```
