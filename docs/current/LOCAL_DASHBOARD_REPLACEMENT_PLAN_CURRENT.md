# Lokaler Dashboard-Ersatz - aktueller Plan

Stand: 2026-06-28

## Aktueller Stand

```text
0.2.11 - Runtime-Profil / Agent-Executor / User-Rechte-Sync Foundation vorbereitet
```

0.2.10H hat die Remote-Asset-Pfade fuer `/dashboard-v2` repariert. 0.2.10I hat die Architekturentscheidung dokumentiert. 0.2.11 macht diese Architektur lokal als Runtime-Profil pruefbar.

## Zielregel UI

```text
Das lokale Dashboard-v2 soll optisch und strukturell eine exakte Kopie des Remote-Modboards sein.
```

Nicht lokal nachbauen. Nicht angleichen. Nicht zweite UI pflegen.

```text
Remote-Modboard = UI-Wahrheit.
Dashboard-v2 lokal = dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
```

Abweichungen sind nur erlaubt bei:

```text
- Datenquelle,
- API-Adapter,
- Runtime-Profil,
- Berechtigungen,
- Sicherheitsgrenzen.
```

## Zielregel Zugriff

```text
Mods:
immer https://mods.forrestcgn.de/

Forrest/Engel zuhause:
lokal am Streaming-PC/LAN ueber /dashboard-v2

Forrest/Engel unterwegs:
online ueber https://mods.forrestcgn.de/
```

Mods bekommen keinen direkten Zugriff auf den Streaming-PC.

## Zielregel Agent

```text
Alles, was den Streaming-PC aktiv betrifft, laeuft am Ende ueber den Stream-PC-Agent.
```

Beispiele:

```text
- Sound stoppen,
- Sound testen,
- OBS-Aktion,
- Overlay-/Alert-/Command-nahe Aktion,
- lokale Modul-Config schreiben,
- Datei/Asset im erlaubten Modulbereich aendern,
- Streamer.bot/OBS/lokalen Node-Controller ansprechen.
```

Online-Weg:

```text
Modboard online -> Webserver -> Agent -> Streaming-PC-Aktion
```

Lokaler Weg:

```text
Dashboard-v2 lokal -> lokaler Server/Adapter -> Agent -> Streaming-PC-Aktion
```

Der Agent ist der zentrale Executor. Keine freien Shell-/Datei-/Prozessbefehle.

## Zielregel User/Rechte Sync

```text
User/Rechte duerfen lokal und online geaendert werden.
Beide Seiten synchronisieren sich.
Sperren/Entzug von Rechten muessen online sofort wirken.
```

Praktisch:

```text
- Forrest/Engel arbeiten meistens lokal.
- Forrest/Engel duerfen unterwegs online Rechte/User aendern.
- Boss-Mods duerfen online gekuendigte Mods sperren/Rechte entziehen, wenn ihre Rolle das erlaubt.
- Online-Sperren wirken sofort auf dem Webserver.
- Der lokale Stand wird ueber den Agent nachgezogen, sobald verbunden.
```

Konfliktregel fuer spaetere Umsetzung:

```text
- Sperren/Entzug gewinnen sofort und sicherheitsseitig.
- Bei normalen Rechteaenderungen gewinnt der neuere, versionierte Stand.
- Jede Rechteaenderung braucht Actor, Timestamp, Quelle, Revision und Audit.
```

## 0.2.11 Foundation

Neue read-only Diagnose-/Profil-Endpunkte:

```text
GET /api/remote/local-dashboard/runtime-profile
GET /api/remote/local-dashboard/architecture
```

Ziel:

```text
- Runtime-Profil lokal pruefbar machen,
- UI-Quelle "Remote-Modboard" explizit melden,
- Agent-Executor als vorbereitet/geplant markieren,
- User/Rechte-Sync als vorbereitet/geplant markieren,
- aktive Writes und Stream-PC-Actions weiterhin blockieren.
```

0.2.11 aktiviert noch nichts Produktives. Es erzeugt nur eine klare technische Grundlage fuer die naechsten Steps.

## Sicherheitsgrenzen

- keine zweite lokale UI,
- keine DB-Migration,
- keine produktiven Writes,
- keine neuen aktiven Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- `/dashboard` bleibt unveraendert,
- kein Webserver-Deploy noetig.
