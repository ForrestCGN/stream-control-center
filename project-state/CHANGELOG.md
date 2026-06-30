# CHANGELOG

## 0.2.107 - Remote Modboard Scope Selection and System Map

- Systemkarte fuer naechste Scope-Auswahl erstellt:
  `docs/current/RDAP_0.2.107_REMOTE_MODBOARD_SCOPE_SELECTION_AND_SYSTEM_MAP.md`
- Festgehalten:
  - Media-Picker ist abgeschlossen/read-only,
  - lokales Dashboard-v2 ist fuer Media-Picker angeglichen/read-only,
  - Remote-Modboard online bleibt UI-Wahrheit,
  - Agent-/Sync-/Permission-Themen brauchen eigenen Scope,
  - DB-/Write-/Gate-Themen brauchen eigenen Scope mit Permission/Confirm/Audit/Lock/Readback.
- Naechsten Runtime-Plan `0.2.108 - Next Runtime Scope Plan` vorbereitet.
- Keine Runtime-Code-Dateien geaendert.
- Kein Backend geaendert.
- Kein Webserver-Deploy noetig.

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
