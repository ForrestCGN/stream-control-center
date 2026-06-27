# TODO

Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD  
Datum: 2026-06-27

## Erledigt/vorbereitet

```text
RDAP101B:
- Public WSS Heartbeat live bestaetigt.
- Runtime final disabled.

RDAP103:
- Vorhandene Verbindungen-Seite erweitert.
- Stream-PC Verbindung read-only sichtbar.
- Keine Actions/Start/Stop Buttons.

RDAP104B:
- Server-Deploy-Wrapper auf Webserver vorhanden.
- Cleanup-Script auf Webserver vorhanden.
- Bash-Syntaxchecks sauber.
- Cleanup live ausgefuehrt.
- Neuer Deploy-Standard aktiv.

RDAP105:
- Doku-Inventur und Cleanup-Plan erstellt.
- docs/current/project-state Ueberfuellung erkannt.
- Doku-Aufraeumung vor weiteren Features priorisiert.

RDAP106:
- zentrale Current-State-Doku neu aufgebaut.
- Overview/Roadmap aktualisiert.
- Current Remote-Modboard State erstellt.
- Current Dashboard State erstellt.
- Current Stream-PC Agent State erstellt.
- Doku-Struktur-/Archivregeln erstellt.
- Historische Dateien nicht geloescht oder verschoben.
```

## Naechster Schritt

```text
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

## Offen / pruefen in RDAP107

```text
- Welche vorhandenen Felder aus /api/remote/agent/status sicher read-only angezeigt werden koennen.
- Welche Texte/Labels in Admin / Verbindungen verbessert werden sollen.
- Ob bestehende rdap80-agent-status.js erweitert werden kann.
- Ob weitere Backend-Statusfelder noetig sind oder vorhandene reichen.
- Keine Secrets, Rohpayloads, Env-/Pfad-/Prozess-/Dateilisten anzeigen.
```

## Spaeter

```text
- Archive-Index fuer historische RDAP/CAN/DASHUI-Dateien planen.
- Lokalen LAN-Betrieb mit EngelCGN sauber planen.
- Agent-Allowlist und Sicherheitsgrenzen separat planen.
```
