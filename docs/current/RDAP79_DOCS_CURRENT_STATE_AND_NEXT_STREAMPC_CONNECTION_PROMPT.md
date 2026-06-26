# RDAP79_DOCS_CURRENT_STATE_AND_NEXT_STREAMPC_CONNECTION_PROMPT

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only Abschluss / aktuelle Wahrheit / neuer Chat-Prompt

## Zweck

RDAP79 schliesst den zuletzt langen Admin-Notes-/Registry-Block dokumentarisch ab und richtet die naechste Arbeit wieder auf das eigentliche Hauptziel aus:

```text
Verbindung Webserver <-> Stream-PC
Remote-Modboard als zentrale Weboberflaeche
Stream-PC als lokaler Agent/Ausfuehrer
```

Admin-Notizen werden nach RDAP78C fuer jetzt eingefroren. Keine weitere Politur an diesem Bereich, solange kein echter Fehler gemeldet wird.

## Aktueller getesteter Stand

```text
RDAP77B:
- Frontend-Registry / Admin-Unterseiten eingefuehrt.
- Admin ist Obermodul.
- Admin-Notizen und User-Detail sind Admin-Pages.
- Inaktive Panels werden sauber versteckt.
- Header, Navigation und sichtbares Panel passen.

RDAP78C:
- Admin-Notes Zieluser-Kontext korrigiert.
- ForrestCGN zeigt eigene Notizen.
- EngelCGN zeigt keine falschen Forrest-Notizen mehr.
- Stale Count aus remote-modboard.js Notice-Humanizer korrigiert.
```

## Aktueller Admin-Notes Stand

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> Backend confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

Browser-Stand:

```text
Admin -> Admin-Notizen:
- Zieluser Auswahl funktioniert.
- ForrestCGN: eigene Notizen sichtbar.
- EngelCGN: keine Forrest-Notizen, korrekte Keine-Notizen-Notice.
- falscher Count "4 Notizen geladen" fuer EngelCGN ist weg.

Admin -> User-Detail:
- eigene Admin-Page.
- nicht mehr unter Admin-Notes angehaengt.
- Header/Nav/Panel-State passt.
```

## Was bewusst eingefroren wird

```text
Admin-Notes UI-Politur
Admin-Notes Delete/Deactivate
Admin-Notes Community-Read
weitere Count-/Titel-Kosmetik
Admin-User-Detail optische Politur
Rollen-/Gruppen-/Permission-Writes
```

Diese Punkte erst wieder anfassen, wenn sie fuer einen echten naechsten fachlichen Ausbau noetig sind.

## Zielbild Webserver <-> Stream-PC

```text
Browser
  -> mods.forrestcgn.de / Remote-Modboard
  -> Webserver Backend
  -> gesicherter Agent-Kanal
  -> Stream-PC Agent
  -> erlaubte lokale Aktionen
```

Wichtige Grundentscheidung:

```text
Der Stream-PC baut aktiv die Verbindung zum Webserver auf.
Keine Portfreigabe am Stream-PC.
Keine eingehenden Verbindungen aus dem Internet zum Stream-PC.
Dynamische IP ist egal.
```

## Rollen der Komponenten

### Webserver

```text
- Login/Auth/Session
- User/Rollen/Rechte
- Modul-/Page-Registry im Frontend
- API-Gateway fuer erlaubte Remote-Aktionen
- Agent-Status
- Audit
- Locks/Confirm fuer kritische Aktionen
- spaeter: Auftragsqueue fuer Agent
```

### Stream-PC Agent

```text
- verbindet aktiv zum Webserver
- meldet Heartbeat/Status/Version
- nimmt nur erlaubte Actions aus Allowlist an
- fuehrt keine freie Shell aus
- fuehrt keine freien Datei-/Prozess-/URL-Kommandos aus
- antwortet mit Ergebnis/Audit-Daten
```

## Harte Sicherheitsgrenzen fuer Agent

```text
Keine freie Shell.
Keine freie Dateioperation.
Keine freie Prozessausfuehrung.
Keine freie URL-Ausfuehrung.
Keine ungeprueften OBS-/Sound-/Overlay-/Command-Actions.
Jede Action braucht spaeter:
- eindeutigen actionType
- serverseitige Permission
- Allowlist
- Parameter-Validierung
- Audit
- optional Confirm/Lock
```

## Naechster empfohlener technischer Step

```text
RDAP80_AGENT_CONNECTION_ARCHITECTURE_AND_STATUS_FOUNDATION
```

Ziel:

```text
- Architektur fuer Webserver <-> Stream-PC Agent konkretisieren.
- Bestehende remote_agent / Remote-Modboard Dateien pruefen.
- Status-/Readiness-Modell fuer Agent sauber definieren.
- Noch keine produktiven Remote-Actions.
- Falls Code: nur Status/Heartbeat/Read-only Foundation.
```

## Erstes sichtbares Agent-Ziel

```text
Remote-Modboard zeigt:
- Agent disabled / offline / online
- letzter Heartbeat
- Agent-ID / Stream-PC Name
- Agent-Version
- erlaubte Feature-Gruppen spaeter
```

Kein OBS steuern, keine Sounds ausloesen, keine Overlays schalten in diesem ersten Agent-Step.

## Reihenfolge ab jetzt

```text
1. RDAP79 Doku-Abschluss.
2. Neuer Chat mit NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP79.
3. RDAP80 Agent-Verbindungsarchitektur planen.
4. Erst auf go Code bauen.
5. Erst Status/Heartbeat, keine produktiven Actions.
```
