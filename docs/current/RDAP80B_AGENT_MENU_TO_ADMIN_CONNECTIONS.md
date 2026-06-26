# RDAP80B_AGENT_MENU_TO_ADMIN_CONNECTIONS

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: UI-Korrektur + Doku / keine Backend-Aenderung / read-only

## Anlass

Nach RDAP80 war die neue Statusseite sichtbar als:

```text
Agent -> Agent-Status
```

Das war fachlich zu technisch und als eigenes Hauptmodul zu frueh. Das eigentliche Ziel war die Verbindung Webserver <-> Stream-PC, nicht ein sichtbares Agent-Bedienmodul.

## Korrektur

Die sichtbare Navigation wird geaendert zu:

```text
Admin -> Verbindungen
Seite: Stream-PC Verbindung
```

Damit bleibt der technische Agent-Begriff intern moeglich, aber die UI zeigt fuer Admins eine verstaendlichere Infrastruktur-/Verbindungsseite.

## Unveraendert

```text
GET /api/remote/agent/status
/api/remote/status .agent
/api/remote/routes Eintrag fuer /api/remote/agent/status
Status API Version rdap_agent80.v1
Read-only Statusmodell
Heartbeat-Foundation disabled/offline
```

## Geaenderte Datei

```text
remote-modboard/backend/public/assets/rdap80-agent-status.js
```

## Sichtbares Ergebnis

```text
Vorher:
Agent -> Agent-Status

Nachher:
Admin -> Verbindungen
Stream-PC Verbindung
```

## Bewusst nicht gemacht

```text
Keine Backend-Aenderung.
Keine neue Route.
Keine DB-Migration.
Keine neue Permission.
Keine Admin-Notes-Aenderung.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Commands/Channelpoints.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Remote-Actions.
```

## Lokale Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\rdap80-agent-status.js

git status --short
git diff --stat
```

## Browser-Test

```text
https://mods.forrestcgn.de/
Admin -> Verbindungen
```

Erwartung:

```text
Seite zeigt Stream-PC Verbindung.
Status ist offline/disabled.
Heartbeat ist leer.
Keine Action-Buttons sichtbar.
Kein eigenes Hauptmodul Agent mehr sichtbar.
```
