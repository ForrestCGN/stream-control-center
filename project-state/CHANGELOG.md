# CHANGELOG

## 0.2.106 - Media Picker Module Docs Closeout

- Neue Modul-Doku erstellt:
  `docs/modules/media-picker.md`
- Online-/Lokal-Stand des Media-Pickers zusammengefuehrt dokumentiert.
- Bestaetigte API-Routen, UI-Begriffe, Runtime-Profile und Sicherheitsgrenzen festgehalten.
- Media-Picker-Block als read-only, mod-tauglich, online/lokal angeglichen und dokumentiert abgeschlossen.
- Keine Runtime-Code-Dateien geaendert.
- Kein Backend geaendert.
- Kein Webserver-Deploy noetig.
- Naechsten Block `0.2.107 - Next System Scope Selection` vorbereitet.

## 0.2.105 - Local Media Picker Verify and Polish Docs

- Lokale Browserpruefung nach 0.2.104 dokumentiert.
- Forrest bestaetigt: Media-System funktioniert lokal wie im ModBoard.
- Lokale API-Checks aus 0.2.104 als bestaetigter Stand festgehalten:
  - Context-List `total=412`, `count=25`,
  - `readOnly=True`,
  - `writeEnabled=False`,
  - `databaseWriteExecuted=False`.
- Keine Runtime-Code-Dateien geaendert.
- Kein Backend geaendert.
- Kein Webserver-Deploy noetig.
- Naechsten Entscheidungsblock `0.2.106 - Media Picker Next Scope Decision` vorbereitet.

## 0.2.104 - Local Media Picker Readonly Alignment

- `backend/modules/local_remote_modboard_adapter.js` erweitert.
- Neue lokale Read-only-Route:
  `GET /api/remote/media/index/context/list`
- Lokale Context-Route liest das bestehende lokale Media-Inventar read-only.
- Query-Felder vorbereitet:
  `root_key`, `module_key`, `category_key`, `full_category_key`, `kind`, `limit`, `offset`.
- Lokaler Media-Scan um `htdocs/assets/media` ergaenzt.
- Lokale Media-Items erhalten Kontextfelder:
  `moduleKey`, `categoryKey`, `fullCategoryKey`.
- `htdocs/dashboard-v2/assets/modules/media/library.js` auf den bestaetigten Online-Picker-Stand angeglichen.
- Lokale UI nutzt jetzt denselben Picker mit Bereich/Ordner/Dateityp/Anzahl/Anzeigen/Pagination.
- Keine Online-Remote-Modboard-Datei geaendert.
- Keine DB-Writes, keine Gates, keine Agent-Actions.
- Keine Upload/Edit/Delete-Aktion.
- Kein Webserver-Deploy noetig.

## 0.2.103 - Local Media Picker Alignment Plan

- Lokale Media-Picker-Angleichung als naechsten Read-only-Block festgehalten.
- Online-Media-Picker bleibt fachliche UI-Wahrheit fuer Layout, Sprache und Mod-taugliche Begriffe.
- Zielbild dokumentiert: eine UI, zwei Runtime-Profile (`online` / `local`).
- Sicherheitsgrenzen fuer lokale Angleichung festgehalten: keine DB-Writes, keine Gates, keine Upload/Edit/Delete-Aktion, keine Online->Agent Dateiaktion.
- Naechsten Runtime-Block `0.2.104 - Local Media Picker Readonly Alignment` vorbereitet.
- Keine Runtime-Code-Dateien geaendert.
- Kein Backend geaendert.
- Kein Webserver-Deploy noetig.
