Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG ZUERST:

* GitHub/dev ist Wahrheit.
* Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
* Keine ZIPs vor `go`.
* Keine Funktionalitaet entfernen.
* Keine Mini-Steps ohne Not.
* Keine Patch-/Apply-/Regex-/Set-Content-/Append-Scripte.
* Wenn Dateien geaendert werden: aktuelle komplette Datei lesen und vollstaendige Ersatzdatei liefern.
* Keine neuen Module/Dateien ohne Not. Bestehende Struktur bevorzugen.
* UI ist fuer Mods gedacht: keine technischen Labels, keine DB-Begriffe, keine Developer-Diagnose in der Hauptansicht.
* CGN-Design beachten: dunkles Lila/Blau, Neon-Cyan/Violett, runde Panels, Glow/Chips, Glassmorphism. Keine weissen Browser-Standard-Dropdowns.

Repository:

* GitHub: `ForrestCGN/stream-control-center`
* Branch: `dev`
* Lokales Repo: `D:\Git\stream-control-center`
* Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
* Remote-Modboard live: `https://mods.forrestcgn.de/`
* Webserver-Pfad: `/opt/stream-control-center`
* Webserver laeuft als root, also kein `sudo`.

Workflow:

1. Erst GitHub/dev und relevante Doku-/Code-Dateien lesen.
2. Dann kurzen Plan nennen.
3. Auf mein `go` warten.
4. Erst dann ZIP bauen.
5. ZIP muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
6. Ich spiele lokal ein mit:

   ```powershell
   cd D:\Git\stream-control-center
   .\installstep.cmd "$env:USERPROFILE\Downloads\<ZIPNAME>.zip" "<Step Beschreibung>"
   ```

7. Danach lokale Checks/Syntax/git status.
8. Wenn sauber:

   ```powershell
   .\stepdone.cmd "<Step Beschreibung>"
   ```

9. Danach Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen:

   ```bash
   bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh <STEP_NAME> dev
   ```

10. Danach gezielte curl/jq/UI Checks.

Aktueller Stand:

`0.2.102 - Online Media Picker Docs Handoff vorbereitet`

Fachlich bestaetigter Stand davor:

`0.2.101 - Media Picker Pagination and Dedup live ok`

Bestaetigt:
* Media-Picker online im Remote-Modboard laeuft.
* Bestehende Media-Seite wurde genutzt:
  `remote-modboard/backend/public/assets/modules/media/library.js`
* Keine neue Moduldatei.
* Kein Backend fuer 0.2.96 bis 0.2.101.
* Keine DB-Writes.
* Keine Gates.
* Keine Upload/Edit/Delete-Aktion.
* Keine Agent-Aktion.
* Pagination wurde korrigiert:
  * `Zurueck` / `Weiter` laedt echte Seiten ueber Context-API.
  * Context-API nutzt `limit` und `offset`.
  * Anzeige unten z. B. `1-25 von 412 Dateien`.
* UI wurde modfreundlicher:
  * `Modul` -> `Bereich`
  * `Kategorie` -> `Ordner`
  * `Kind` -> `Dateityp`
  * `Kontext laden` -> `Anzeigen`
  * `Kontext zuruecksetzen` -> `Filter zuruecksetzen`
  * technische Begriffe wie `Root`, `Full Category`, `Kind`, `Kontext-API`, `DB`, `Writes` aus Hauptansicht weitgehend raus.
* CGN-Design-Polish eingebaut:
  * dunkle Dropdowns
  * Neon-/Glassmorphism-Look
  * keine weissen Standard-Dropdowns
  * keine gelbe Warnbox fuer normale Pagination.

Bestaetigte Basis-API:
```text
GET /api/remote/media/index/context/list
```

Bestaetigter Gesamtindex:
```text
remote_media_index aktiv:
images = 46
media  = 412
sounds = 276
videos = 10
gesamt = 744
```

Naechster sinnvoller Block:

`RDAP_0.2.103_LOCAL_MEDIA_PICKER_ALIGNMENT_PLAN`

Ziel:
* Lokale Media-Picker-Angleichung planen.
* Vorher lokale Dashboard-/Agent-Struktur lesen.
* Pruefen, ob lokal dieselbe `library.js` genutzt wird.
* Pruefen, ob lokale API dieselben Felder/Filter liefern kann.
* Keine Online->Agent Dateiaktion.
* Keine Writes.
* Keine Gates.

Fuer 0.2.103 relevante Dateien zuerst lesen:
* `project-state/CURRENT_STATUS.md`
* `project-state/NEXT_STEPS.md`
* `project-state/TODO.md`
* `remote-modboard/backend/public/assets/modules/media/library.js`
* `remote-modboard/backend/public/assets/remote-modboard.css`
* `remote-modboard/backend/public/assets/modules/module-manifest.js`
* `backend/modules/remote_agent.js`
* lokale Dashboard-/Server-Dateien nach Suche
* `docs/reference/*`
* `docs/current/RDAP119_MODULAR_UI_AND_LOCAL_DASHBOARD_FOUNDATION.md`
* `docs/current/RDAP122_LOCAL_DASHBOARD_RUNTIME_PROFILE.md`

Weiterhin verboten ohne separaten Plan + Go:
* keine Gates aktivieren
* keine DB-Zeilen veraendern
* keine Migration
* kein Tombstone-Execute
* kein Hard-Delete
* kein physisches Loeschen
* kein Online->Agent-Trigger
* keine Upload/Edit/Delete-Aktion
* keine Dateiaktion vom Webserver zum Stream-PC
