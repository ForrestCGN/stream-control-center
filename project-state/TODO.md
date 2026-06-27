# TODO

Stand: RDAP105_DOCS_INVENTORY_AND_CLEANUP_PLAN  
Datum: 2026-06-27

## Erledigt/vorbereitet

```text
RDAP101B:
- Public WSS Heartbeat live bestaetigt.
- Runtime final disabled.

RDAP102:
- Sichtbaren Stream-PC Verbindungsstatus geplant.

RDAP103:
- Vorhandene Verbindungen-Seite erweitert.
- Read-only Status-Semantik verbessert.
- Veralteten RDAP80B-Text aktualisiert.
- Heartbeat-Details verbessert.
- Keine Actions/Start/Stop Buttons.

RDAP104:
- Server-Deploy-Wrapper vorbereitet.
- Backup-/Deploy-Cleanup vorbereitet.
- Workflow-Dokus auf root-ohne-sudo und Ein-Befehl-Deploy aktualisiert.

RDAP104B:
- RDAP104 live bestaetigt.
- Server-Deploy-Wrapper auf Webserver vorhanden.
- Cleanup-Script auf Webserver vorhanden.
- Bash-Syntaxchecks sauber.
- Cleanup live ausgefuehrt.
- Neuer Deploy-Standard aktiv.

RDAP105:
- Doku-Inventur und Cleanup-Plan erstellt.
- docs/current/project-state Ueberfuellung erkannt.
- Doku-Aufraeumung vor weiteren Features priorisiert.
```

## Naechster Schritt

```text
RDAP106_DOCS_CURRENT_STATE_REBUILD
```

## Offen / pruefen in RDAP106

```text
- Welche docs/current-Dateien wirklich aktuelle Start-/Truth-Dateien bleiben.
- Welche RDAP/CAN/DASHUI-Dokus nur historisch sind.
- Welche zentralen Current-State-Dateien neu aufgebaut werden.
- Ob zuerst nur neue Index-/Strukturdateien erstellt werden, ohne Dateien zu verschieben.
- Welche alten Dateien spaeter nach docs/archive/... wandern duerfen.
```

## Danach

```text
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN:
- weitere Stream-PC-Verbindungsdetails nur read-only planen
- keine Runtime-Aktivierung
- keine Agent-Actions
```
