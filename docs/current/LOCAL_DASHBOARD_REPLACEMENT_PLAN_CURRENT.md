# Lokaler Dashboard-Ersatz - aktueller Plan

Stand: 2026-06-28

## Aktueller Stand

```text
0.2.13 - OBS read-only Grundlage vorbereitet
```

0.2.10H hat die Remote-Asset-Pfade fuer `/dashboard-v2` repariert. 0.2.10I dokumentiert die Online/Lokal-Architektur. 0.2.11/0.2.12 haben Runtime-Profil und Agent-Executor-Diagnose vorbereitet. 0.2.13 setzt OBS als erstes fachliches Modul read-only auf.

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

## OBS read-only Grundlage 0.2.13

OBS ist als erstes echtes Modul sinnvoll, weil Szenen, Quellen, Audio, Media und Overlay-Quellen daran haengen.

0.2.13 aktiviert noch keine OBS-Steuerung. Es macht nur read-only sichtbar:

```text
/api/remote/local-dashboard/obs/status
/api/remote/local-dashboard/obs/model
```

Quelle ist der bestehende `remote_agent`-Status:

```text
/api/remote-agent/status
```

Sicherheitsgrenzen in 0.2.13:

```text
- keine OBS-WebSocket-Kommandos durch den lokalen Adapter,
- kein Szenenwechsel,
- kein Mute/Unmute,
- keine Quellen-Sichtbarkeit aendern,
- keine Media-Steuerung,
- keine Agent-Actions,
- keine Writes,
- kein DB-/Datei-/Shell-/Prozess-Zugriff.
```

Szenen-/Quellen-Inventar ist vorbereitet, aber noch leer/read-only. Das aktive Auslesen von Szenen/Quellen kommt erst in einem spaeteren, eigenen Step.

## Sicherheitsgrenzen

- keine zweite lokale UI,
- keine produktiven Writes,
- keine neuen Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- `/dashboard` bleibt unveraendert,
- kein Webserver-Deploy fuer lokale Dashboard-v2-/Doku-Steps.
