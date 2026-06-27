# CURRENT_DASHBOARD_STATE

Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD  
Datum: 2026-06-27  
Projekt: `stream-control-center` / lokales Dashboard / Dashboard-v2

## Zweck

Diese Datei haelt den aktuellen lokalen Dashboard-/stream-control-center-Kontext knapp fest, damit Remote-Modboard und lokales Dashboard nicht vermischt werden.

## Lokale Basis

```text
Lokales Repo:
D:\Git\stream-control-center

Lokales Live-System:
D:\Streaming\stramAssets

Lokaler Server:
http://127.0.0.1:8080

Dashboard:
http://127.0.0.1:8080/dashboard
```

## Bekannte lokale Bereiche

```text
- Overlays
- Sounds
- Streamer.bot-Anbindung
- OBS-/WebSocket-Anbindung
- Dashboard-v2
- lokale Daten/configs
- Stream-/Event-bezogene Statistiken spaeter
```

## Dashboard-v2 Snapshot-Befund aus RDAP105

```text
dashboard-v2.zip:
- 5 Eintraege
- Build-/Frontend-Ausgabe
- index.html
- assets/*.js
- assets/*.css
- keine Doku-Dateien
```

## Abgrenzung zu Remote-Modboard

Remote-Modboard ist nicht einfach das lokale Dashboard auf dem Webserver.

Remote-Modboard-Regeln:

```text
- oeffentliche Webserver-Oberflaeche
- serverseitige Auth-/Rechtepruefung
- keine direkte lokale Systemsteuerung
- spaeter nur ueber Agent und Allowlist
```

Lokales Dashboard:

```text
- laeuft lokal im Stream-Setup
- darf lokale Integrationen haben
- muss fuer Online-/Remote-Zugriff getrennt betrachtet werden
```

## Sicherheitsgrenze

Keine Remote-Modboard-Arbeit darf nebenbei lokale Dashboard-Funktionen produktiv oeffnen.

Insbesondere nicht nebenbei:

```text
- OBS-Steuerung remote aktivieren
- Sound-Ausloesung remote aktivieren
- Overlay-Schaltung remote aktivieren
- lokale Dateien/Prozesse remote freigeben
- freie URLs/Befehle aus Webserver heraus ausfuehren
```

## Lokaler LAN-Betrieb spaeter

Langfristig geplant:

```text
- Forrest kann lokal arbeiten.
- EngelCGN soll im LAN passend arbeiten koennen.
- Lokale Bedienung braucht trotzdem Rechte-/Auth-Grenzen.
- Online- und Lokalbetrieb duerfen keine Sicherheitsloecher gegeneinander oeffnen.
```

## Doku-Hinweis

Dashboard-v2 wird in RDAP106 nicht technisch veraendert. Diese Datei ist nur Current-State-Kontext fuer spaetere Planung.
