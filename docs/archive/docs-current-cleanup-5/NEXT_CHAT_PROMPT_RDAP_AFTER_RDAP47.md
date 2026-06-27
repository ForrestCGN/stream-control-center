# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP47

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wichtigste Arbeitsweise

```text
1. Immer zuerst GitHub/dev und echte Dateien pruefen.
2. Startdateien wirklich lesen.
3. Dann kurzen Plan nennen.
4. Auf Forrests explizites "go" warten.
5. Keine Funktionalitaet entfernen.
6. Keine parallelen Strukturen erfinden.
7. Fehlende Dateien exakt anfragen, nicht raten.
8. ZIPs immer mit echten Repo-Zielpfaden bauen.
9. Lokal: installstep -> Checks -> stepdone.
10. stepdone bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
11. Bei Backend/UI-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone unter /opt/stream-control-center/_deploy_tmp.
12. Fuer RDAP-Webserver-Deploys den kurzen relativen _deploy_tmp-Stil verwenden.
13. Doku-only braucht keinen Webserver-Deploy.
```

## Zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller bestaetigter Stand vor Live-Test

```text
RDAP44: Admin-Notizen-Zieluser-Auswahl live bestaetigt.
RDAP45B/RDAP45C: Twitch-Login/Deploy-Safety korrigiert und dokumentiert.
RDAP46: Naechster kleiner Admin-Notizen-Step geplant.
RDAP47: Zieluser-Suche/Filter fuer Admin-Notizen als Frontend-only vorbereitet.
```

## RDAP47 Ziel

```text
Admin -> Admin-Notizen bekommt eine komfortablere Zieluser-Auswahl:
- Suchfeld nach Name/Login/UID/Status/Rollen
- Trefferanzeige
- Suche leeren
- Default ForrestCGN bleibt erhalten
- Read/Create bleiben unveraendert auf dem ausgewaehlten Zieluser
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Permission-Verwaltung in der UI
Community-Seiten duerfen Admin-Notizen nicht lesen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Nach RDAP47 lokal/stepdone

Da RDAP47 Frontend-Code aendert, ist danach ein Webserver-Deploy noetig:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED
cd RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED dev
```

## Live-Test

```bash
curl -fsS http://127.0.0.1:3010/assets/rdap28-admin-notes.js | grep -n "adminNotesTargetSearch\|adminNotesTargetClearSearchButton\|TARGET_USER_UID"
curl -s -o /dev/null -w "twitch/start HTTP %{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/start
curl -s -o /dev/null -w "twitch/callback HTTP %{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/callback
```

Erwartung:

```text
adminNotesTargetSearch vorhanden
adminNotesTargetClearSearchButton vorhanden
TARGET_USER_UID nicht vorhanden
twitch/start HTTP 302 bei aktivem Login
twitch/callback HTTP 403 ohne OAuth-State
```

## Naechster moeglicher Schritt nach Live-Bestaetigung

```text
RDAP47B_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_LIVE_CONFIRMED_DOCS
```

Danach sinnvoll:

```text
RDAP48_ADMIN_USER_DETAIL_READONLY_PLAN
```
