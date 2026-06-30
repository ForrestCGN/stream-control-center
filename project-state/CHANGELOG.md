# CHANGELOG

## 0.2.103 - Local Media Picker Alignment Plan

- Lokale Media-Picker-Angleichung als naechsten Read-only-Block festgehalten.
- Online-Media-Picker bleibt fachliche UI-Wahrheit fuer Layout, Sprache und Mod-taugliche Begriffe.
- Zielbild dokumentiert: eine UI, zwei Runtime-Profile (`online` / `local`).
- Sicherheitsgrenzen fuer lokale Angleichung festgehalten: keine DB-Writes, keine Gates, keine Upload/Edit/Delete-Aktion, keine Online->Agent Dateiaktion.
- Naechsten Runtime-Block `0.2.104 - Local Media Picker Readonly Alignment` vorbereitet.
- Keine Runtime-Code-Dateien geaendert.
- Kein Backend geaendert.
- Kein Webserver-Deploy noetig.

## 0.2.102 - Online Media Picker Docs Handoff

- Doku nach live bestaetigtem Online-Media-Picker Stand `0.2.101` aktualisiert.
- Festgehalten: Media-Picker ist online read-only nutzbar und modfreundlicher formuliert.
- Festgehalten: Pagination funktioniert ueber Context-API mit `limit` und `offset`.
- Festgehalten: keine DB-Writes, keine Gates, keine Upload/Edit/Delete-Aktion, keine Agent-Aktion.
- Naechsten Block fuer lokale Angleichung vorbereitet.
- Keine Runtime-Code-Dateien geaendert.
- Kein Webserver-Deploy noetig.

## 0.2.101 - Media Picker Pagination and Dedup

- `remote-modboard/backend/public/assets/modules/media/library.js` erweitert.
- `Zurueck` / `Weiter` laedt echte neue Seiten aus der Context-API.
- Context-API nutzt `limit` und `offset`.
- Doppelte Status-/Zaehlertexte reduziert.
- Pagination unten zeigt z. B. `1-25 von 412 Dateien`.
- Live ok bestaetigt.
- Keine Backend-Aenderung, keine DB-Writes, keine Gates.

## 0.2.100 - Media Picker CGN Design Polish

- Dropdowns in den CGN-Look gebracht.
- Unnoetige Warnbox fuer normale Pagination entfernt.
- Dunkle Neon-/Glassmorphism-Flächen beibehalten.
- Keine Backend-Aenderung.

## 0.2.99 - Media Picker Mod-friendly Filters

- Technische Labels fuer Mods ersetzt:
  - `Modul` -> `Bereich`
  - `Kategorie` -> `Ordner`
  - `Kind` -> `Dateityp`
  - `Kontext laden` -> `Anzeigen`
  - `Kontext zuruecksetzen` -> `Filter zuruecksetzen`
- `Full Category` aus der sichtbaren Haupt-UI entfernt.
- Keine Backend-Aenderung.

## 0.2.98 - Media Picker Page Size Dropdown

- Dropdown fuer Anzahl pro Seite ergaenzt.
- Werte: 25, 50, 100, 200.
- Context-API wird mit passendem `limit` geladen.
- Keine Backend-Aenderung.

## 0.2.97 - Media Picker Context UI Polish

- Context-Modus in der Media-UI lesbarer gemacht.
- Falsche/alte Inventartexte reduziert.
- Keine Backend-Aenderung.

## 0.2.96 - Media Picker readonly UI

- Bestehende Media-Seite erweitert.
- Nutzt zusaetzlich `/api/remote/media/index/context/list`.
- Keine neue Moduldatei.
- Kein Backend.
- Keine Writes/Gates/Agent-Aktion.

## 0.2.95 - Media Index Context Read API Docs Handoff

- Doku nach live bestaetigter 0.2.94 Context-Read-API aktualisiert.
- Festgehalten: `/api/remote/media/index/context/list` liefert read-only Kontext-/Media-Listen aus `remote_media_index`.
- Festgehalten: Live-Checks bestaetigen `root_key=media total=412`, `module_key=alerts total=132`, `full_category_key=alerts/follow total=53`.
- Festgehalten: 0.2.94 wurde ohne neues Modul umgesetzt; geaendert wurden nur `media-index-diff.routes.js` und `routes.routes.js`.
- Keine Runtime-Code-Dateien geaendert.

## 0.2.94 - Media Index DB Context Read API readonly fixed

- Bestehende Route-Datei `remote-modboard/backend/src/routes/media-index-diff.routes.js` erweitert.
- `/api/remote/routes` in `remote-modboard/backend/src/routes/routes.routes.js` ergaenzt.
- Neue read-only Route: `GET /api/remote/media/index/context/list`.
- Filter: `root_key`, `module_key`, `category_key`, `full_category_key`, `kind`, `limit`, `offset`.
- Live bestaetigt: `readOnly=true`, `writeEnabled=false`, `databaseWriteExecuted=false`.
- Live bestaetigt: `media=412`, `alerts=132`, `alerts/follow=53`.
- Keine DB-Writes, keine Gates, keine Migration, kein neues Modul, keine `app.js`-Aenderung.
