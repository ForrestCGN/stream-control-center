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
* Webserver laeuft als root, also normalerweise kein sudo noetig.

Pflichtkontext / Masterprompt:

1. Masterprompt lesen:
   `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`

2. Start-/Statusdateien lesen:
   `docs/current/START_HERE_FOR_NEW_CHAT.md`
   `project-state/CURRENT_STATUS.md`
   `project-state/NEXT_STEPS.md`
   `project-state/TODO.md`
   `project-state/FILES.md`
   `project-state/CHANGELOG.md`

3. Diese Handoff-Datei lesen:
   `docs/current/RDAP_0.2.52_REMOTE_AND_LOCAL_MEDIA_MOD_USABLE_LIST.md`

Aktueller Stand:
`0.2.52 - Media Mod Usable List`

Bestaetigt / umgesetzt:

* Media-Liste online und lokal fuer Mods besser bedienbar.
* Online- und lokale Media-Library wurden beide geaendert:
  * `remote-modboard/backend/public/assets/modules/media/library.js`
  * `htdocs/dashboard-v2/assets/modules/media/library.js`
* Suche nach Datei, Bereich oder Typ.
* Sortierung nach Name, Bereich, Groesse, Geaendert.
* Paging mit 50 Eintraegen pro Seite.
* Info-Fenster pro Medium fuer technische Details.
* Pfad ist aus der Hauptkarte raus und nur noch in Info sichtbar.
* Filter und Neu laden bleiben erhalten.
* Upload/Edit/Delete bleiben gesperrt.
* Fallback/Writes bleiben aus.

Bekannte Einschraenkung:

* Es gibt aktuell keine echten sprechenden Anzeigenamen fuer Medien.
* Die UI nutzt deshalb weiter Dateiname/relativePath als Basis.
* Sprechende Namen/Kategorien/Tags/Beschreibungen brauchen spaeter einen eigenen Metadata-/Write-Scope.

Naechster sinnvoller Step:
`0.2.53 Media Metadata Konzept / sprechende Namen planen`

Moegliche Inhalte:

* Klaeren, wo Anzeigenamen/Kategorien/Tags/Beschreibungen gespeichert werden duerfen.
* Klaeren, ob read-only Vorschau sinnvoll ist.
* Vor Writes eigenen Security-Scope planen:
  * Auth
  * Permission
  * Confirm-Write
  * Audit
  * Lock
  * Backup/Rollback
  * Readback/Test

Verbindlicher Workflow:

1. Zuerst GitHub/dev und die oben genannten Doku-/State-Dateien lesen.
2. Dann relevante UI-/Backend-Dateien lesen.
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
10. Danach erst Webserver-Deploy, wenn remote-modboard Code geaendert wurde.
11. Live-Pfad ist KEIN Git-Repo. Kein `git pull` in `/opt/stream-control-center`.
12. Keine Secrets posten.

Wichtig:
Keine unnoetigen Mini-/Skelett-Steps. Ein Step soll eine sichtbare nutzbare Verbesserung bringen.
