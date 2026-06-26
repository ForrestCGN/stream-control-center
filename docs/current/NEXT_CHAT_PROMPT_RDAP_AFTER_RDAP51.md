# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP51

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
12. Doku-only braucht keinen Webserver-Deploy.
13. Leitlinie von Forrest: so klein wie noetig, so gross wie moeglich.
```

## Zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller bestaetigter Stand

```text
RDAP47/RDAP47B: Zieluser-Suche/Filter in Admin-Notizen umgesetzt und live dokumentiert.
RDAP48: Admin-User-Detail read-only geplant.
RDAP49/RDAP49B: Admin-User-Detail read-only umgesetzt und live dokumentiert.
RDAP50: Bruecke User-Detail -> Admin-Notizen geplant.
RDAP51: Bruecke User-Detail -> Admin-Notizen vorbereitet.
```

## RDAP51 Scope

```text
Frontend-only.
Button Admin-Notizen oeffnen setzt denselben Zieluser.
Admin-Notizen zeigt Kontext-Hinweis Aus User-Detail geoeffnet.
Ruecksprung Zurueck zum User-Detail vorhanden.
Keine zweite Admin-Notizen-Implementierung.
Keine Backend-Aenderung.
Keine DB-Migration.
Keine Permission-Schreibfunktion.
Kein Admin-Note Update/Deactivate/Delete.
```

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

Erwartung:

```text
adminNotesBridgeContext vorhanden.
openNotesForUser vorhanden.
returnToAdminUserDetailFromNotes vorhanden.
TARGET_USER_UID nicht vorhanden.
twitch/start HTTP 302.
twitch/callback HTTP 403.
```

## Browser-Test

```text
Admin -> User-Detail.
ForrestCGN auswaehlen.
Admin-Notizen oeffnen.
Admin-Notizen zeigt Kontext-Hinweis Aus User-Detail geoeffnet.
Zieluser bleibt ForrestCGN / tw:127709954.
Zurueck zum User-Detail funktioniert.
Hinweis ausblenden funktioniert.
Create/Read bleiben unveraendert.
```
