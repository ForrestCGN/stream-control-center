# NEXT_STEPS

Stand: RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP47 Webserver-Deploy und Live-Bestaetigung
```

## Ziel

```text
Die vorbereitete Zieluser-Suche fuer Admin-Notizen live bestaetigen.
```

## Deploy-Standard

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED
cd RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED dev
```

## Tests nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/assets/rdap28-admin-notes.js | grep -n "adminNotesTargetSearch\|adminNotesTargetClearSearchButton\|TARGET_USER_UID"
curl -s -o /dev/null -w "twitch/start HTTP %{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/start
curl -s -o /dev/null -w "twitch/callback HTTP %{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/callback
```

## Erwartung

```text
adminNotesTargetSearch vorhanden.
adminNotesTargetClearSearchButton vorhanden.
TARGET_USER_UID nicht vorhanden.
twitch/start HTTP 302 bei aktivem Login.
twitch/callback HTTP 403 ohne gueltigen OAuth-State.
```

## Browser-Test

```text
Login funktioniert.
Admin -> Admin-Notizen zeigt Zieluser-Suche.
Suche nach forrestcgn findet ForrestCGN / tw:127709954.
Suche leeren zeigt wieder alle geladenen User.
Auswahl eines Users laedt dessen Notizen.
Create bleibt nur mit admin.users.note.write sichtbar.
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
RDAP47B_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_LIVE_CONFIRMED_DOCS
```
