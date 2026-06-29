# Prompt fuer neuen Chat - RDAP Media Mod View Cleanup

Kopiere diesen Prompt komplett in einen neuen Chat.

```text
Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

WICHTIG:
Bitte zuerst wirklich die relevanten Dateien auf GitHub/dev lesen und dann erst planen. Nicht aus Erinnerung arbeiten.

Repository:
- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Webserver Live-Pfad: `/opt/stream-control-center/remote-modboard`
- Webserver Deploy-Temp: `/opt/stream-control-center/_deploy_tmp`
- Live-URL: `https://mods.forrestcgn.de/`
- Webserver intern: `http://127.0.0.1:3010`
- Webserver laeuft als root, also normalerweise kein sudo noetig, ausser deploy-script verlangt es.

Pflichtkontext / Masterprompt:
1. Masterprompt lesen:
   `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`

2. RDAP Workflow Addendum lesen:
   `docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md`

3. Start-/Statusdateien lesen:
   `docs/current/START_HERE_FOR_NEW_CHAT.md`
   `project-state/CURRENT_STATUS.md`
   `project-state/NEXT_STEPS.md`
   `project-state/TODO.md`
   `project-state/FILES.md`
   `project-state/CHANGELOG.md`

Aktueller Stand:
`0.2.48 - Remote-Modboard Media Mod View Cleanup Handoff Docs`

Direkt davor:
`0.2.47B - Remote-Modboard Media UI Source Info Runtime Fix`

Bestaetigt:
- `/api/remote/media/status` funktioniert.
- `sourceInfo` ist vorhanden.
- Agent-Memory ist aktiv.
- Media-UI rendert wieder sichtbar.
- Browser zeigt Media-System, Media-Bereiche und Inventar.
- Beispiel: 120 Medien, Sounds 74, Bilder 46, Videos 0.
- Fallback/Writes bleiben aus.
- Upload/Edit/Delete bleiben gesperrt.

Problem:
Die normale Media-Seite zeigt aktuell zu viele technische Details fuer Mods:
- Agent / DB / Fallback
- Primaere Quelle
- Quelle aktiv
- DB-Index geprueft
- DB-Index verfuegbar
- Fallback
- Writes
- technische Diagnosehinweise wie `?db=1`

Diese Details sind fuer normale Mods nicht relevant. Sie gehoeren in den Admin-/Diagnosebereich, nicht prominent in die normale Media-Uebersicht.

Ziel fuer naechsten funktionalen Step:
`RDAP_0.2.49_REMOTE_MODBOARD_MEDIA_MOD_VIEW_CLEANUP_ADMIN_DIAG_SPLIT`

Gewuenschte Aenderung:
- Bestehende Media-UI enttechnisieren.
- Normale Mod-Ansicht einfach und handlungsorientiert machen.
- Technische sourceInfo-Details aus der normalen Media-Seite entfernen oder stark vereinfachen.
- Quelle/Agent/DB/Fallback/Writes eher in Admin-/Diagnosebereich verschieben.
- Keine neue API, wenn nicht noetig.
- Kein neuer Endpoint, wenn nicht noetig.
- Kein neues Modul, wenn nicht noetig.
- Funktion geht vor, Module nicht aufblasen.

Normale Mod-Ansicht soll zeigen:
- Media-System Header
- Status: Inventar aktiv / read-only
- Modus Online/Lokal
- Inventar-Anzahl
- Media-Bereiche
- Medienliste mit Filter
- kurzer Hinweis:
  "Diese Ansicht ist read-only. Dateien kommen vom Stream-PC/Agent. Upload, Bearbeiten und Loeschen sind deaktiviert."

Normale Mod-Ansicht soll NICHT prominent zeigen:
- `agent_memory`
- DB-Index geprueft/verfuegbar
- Fallback-Flags
- Writes-Flags
- Diagnosehinweise zu `?db=1`

Sicherheitsgrenzen:
- Keine Backend-Write-Routen.
- Keine DB-Item-Reads.
- Keine SQL-Ausfuehrung.
- Keine DB-Migration.
- Keine INSERT/UPDATE/DELETE.
- Keine Media-Daten-Writes.
- Keine Agent-Writes.
- Kein Upload/Edit/Delete.
- Fallback bleibt aus.
- Writes bleiben aus.

Verbindlicher Workflow:
1. Zuerst GitHub/dev und die oben genannten Doku-/State-Dateien lesen.
2. Dann relevante UI-Dateien lesen, besonders:
   `remote-modboard/backend/public/assets/modules/media/library.js`
   und falls Admin-Ziel gebraucht wird:
   `remote-modboard/backend/public/assets/remote-modboard.js`
   sowie vorhandene Admin-/Diagnose-Module.
3. Kurzen Plan nennen.
4. Auf mein explizites `go` warten.
5. Erst dann ZIP bauen.
6. ZIP muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
7. Ich spiele lokal ein mit:
   `cd D:\Git\stream-control-center`
   `./installstep.cmd "$env:USERPROFILE\Downloads\<ZIPNAME>.zip" "<Step Beschreibung>"`
8. Danach lokale Checks/Syntax/git status.
9. Wenn sauber:
   `./stepdone.cmd "<Abschlussbeschreibung>"`
10. Danach erst Webserver-Deploy aus frischem GitHub/dev-Clone unter:
    `/opt/stream-control-center/_deploy_tmp/<STEP_NAME>`
11. Live-Pfad ist KEIN Git-Repo. Kein `git pull` in `/opt/stream-control-center`.
12. Keine Secrets posten.

Wichtig:
Keine unnoetigen Mini-/Skelett-Steps.
Ein Step soll eine sichtbare nutzbare Verbesserung bringen.
```
```
