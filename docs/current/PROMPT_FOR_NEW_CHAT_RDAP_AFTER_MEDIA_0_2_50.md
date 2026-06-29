Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

WICHTIG:
Bitte zuerst wirklich die relevanten Dateien auf GitHub/dev lesen und dann erst planen. Nicht aus Erinnerung arbeiten.

Repository:

* GitHub: `ForrestCGN/stream-control-center`
* Branch: `dev`
* Lokales Repo: `D:\Git\stream-control-center`
* Webserver Live-Pfad: `/opt/stream-control-center/remote-modboard`
* Webserver Deploy-Temp: `/opt/stream-control-center/_deploy_tmp`
* Live-URL: `https://mods.forrestcgn.de/`
* Webserver intern: `http://127.0.0.1:3010`
* Webserver laeuft als root, also normalerweise kein sudo noetig, ausser deploy-script verlangt es.

Pflichtkontext / Masterprompt:

1. Masterprompt lesen:
   `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`

2. RDAP Workflow Addendum lesen:
   `docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md`
   Hinweis: Falls dieser Pfad auf dev fehlt, liegt die Datei aktuell im Archiv:
   `docs/archive/docs-current-cleanup-7/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md`

3. Start-/Statusdateien lesen:
   `docs/current/START_HERE_FOR_NEW_CHAT.md`
   `project-state/CURRENT_STATUS.md`
   `project-state/NEXT_STEPS.md`
   `project-state/TODO.md`
   `project-state/FILES.md`
   `project-state/CHANGELOG.md`

Aktueller Stand:
`0.2.51 - Media 0.2.50 Live Handoff Docs`

Direkt davor:
`0.2.50 - Remote and Local Media List Readability Cleanup`

Bestaetigt:

* 0.2.49D hat den Modul-Autoload lokal repariert.
* Erster Klick auf Media / Medienuebersicht laedt lokal direkt.
* 0.2.50 hat die Medienliste online und lokal von Tabelle auf Karten-/Listenansicht umgestellt.
* Online- und lokale Media-Library wurden beide geaendert:
  * `remote-modboard/backend/public/assets/modules/media/library.js`
  * `htdocs/dashboard-v2/assets/modules/media/library.js`
* Lokale Ansicht zeigt die neue Karten-/Listenansicht.
* Server-API liefert `/api/remote/media/status` weiterhin.
* Beispiel online:
  * total 120
  * sounds 74
  * videos 0
  * images 46
  * audio 72
  * video 2
  * image 46
  * returned 120
  * skipped 8
  * totalSeen 334
* Upload/Edit/Delete bleiben gesperrt.
* Fallback/Writes bleiben aus.

Wichtig gelernter Punkt:
Nicht nur Online-Pfad aendern, wenn lokal getestet wird.

Online / Remote-Modboard:
`remote-modboard/backend/public/...`

Offline / Lokal:
`htdocs/dashboard-v2/...`

Wenn ein UI-Step lokal und online gelten soll, beide Pfade pruefen und ggf. beide Dateien aendern.

Aktueller UI-Stand Media:

* Normale Mod-Ansicht ist enttechnisiert.
* Keine prominenten Agent/DB/Fallback/Writes/?db=1 Details.
* Keine Server-Cache-/Loeschen-/Rechte-/Dateitypen-Karten mehr.
* Media-System Header sichtbar.
* Modus Online/Lokal sichtbar.
* Inventar-Anzahl sichtbar.
* Media-Bereiche sichtbar.
* Medienliste mit Filter sichtbar.
* Read-only-Hinweis sichtbar.
* Liste ist funktional besser, optisch aber noch nicht final.

Naechster sinnvoller funktionaler Step:
`RDAP_0.2.52_REMOTE_AND_LOCAL_MEDIA_SEARCH_SORT_PAGING`

Ziel:
Media-Inventar fuer Mods besser bedienbar machen.

Moegliche Inhalte:

* Suche nach Dateiname.
* Sortierung:
  * Name
  * Bereich
  * Groesse
  * Geaendert
* Einfache Anzeige-Begrenzung / Paging:
  * z.B. 50 pro Seite
  * Vor/Zurueck
* Filter beibehalten.
* Keine Upload/Edit/Delete Buttons.
* Keine Backend-Write-Routen.
* Wenn moeglich keine neue API.
* Keine DB-Item-Reads.
* Keine SQL-Ausfuehrung.
* Keine DB-Migration.
* Keine INSERT/UPDATE/DELETE.
* Keine Media-Daten-Writes.
* Keine Agent-Writes.
* Fallback bleibt aus.
* Writes bleiben aus.

Verbindlicher Workflow:

1. Zuerst GitHub/dev und die oben genannten Doku-/State-Dateien lesen.
2. Dann relevante UI-Dateien lesen, mindestens:
   * `remote-modboard/backend/public/assets/modules/media/library.js`
   * `htdocs/dashboard-v2/assets/modules/media/library.js`
   * `remote-modboard/backend/public/assets/modules/module-manifest.js`
   * `htdocs/dashboard-v2/assets/modules/module-manifest.js`
3. Kurzen Plan nennen.
4. Auf explizites `go` warten.
5. Erst dann ZIP bauen.
6. ZIP muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
7. Lokal einspielen mit:
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
