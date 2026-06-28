# Lokaler Dashboard-Ersatz - aktueller Plan

Stand: 2026-06-28

## Aktueller Stand

```text
0.2.12 - Agent-Executor Diagnose/Handshake vorbereitet
```

0.2.10H hat die Remote-Asset-Pfade fuer `/dashboard-v2` repariert. 0.2.10I hat die Architekturentscheidung festgehalten. 0.2.11 hat Runtime-Profil/Agent-Sync-Foundation vorbereitet. 0.2.12 macht den Agent-Executor-Weg read-only diagnostisch sichtbar.

## Zielregel UI

```text
Remote-Modboard = UI-Wahrheit.
Dashboard-v2 lokal = dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
```

Nicht lokal nachbauen. Nicht angleichen. Nicht zweite UI pflegen.

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

## 0.2.12 Agent-Executor Diagnose

Neue read-only Diagnose-Routen:

```text
GET /api/remote/local-dashboard/agent-executor/status
GET /api/remote/local-dashboard/agent-executor/handshake
```

Diese Routen lesen diagnostisch den bestehenden lokalen Agent-Status aus:

```text
GET /api/remote-agent/status
```

Sie zeigen vorbereitet/diagnostic-only:

```text
- ob `remote_agent.js` geladen ist,
- ob der Agent konfiguriert/verbunden ist,
- welche sichere Route spaeter als zentraler Executor dient,
- dass Actions weiterhin deaktiviert sind.
```

## Zielregel User/Rechte Sync

```text
User/Rechte duerfen lokal und online geaendert werden.
Beide Seiten synchronisieren sich.
Sperren/Entzug von Rechten muessen online sofort wirken.
```

Konfliktregel fuer spaetere Umsetzung:

```text
- Sperren/Entzug gewinnen sofort und sicherheitsseitig.
- Bei normalen Rechteaenderungen gewinnt der neuere, versionierte Stand.
- Jede Rechteaenderung braucht Actor, Timestamp, Quelle, Revision und Audit.
```

## Sicherheitsgrenzen 0.2.12

- keine zweite lokale UI,
- keine DB-Migration,
- keine produktiven Writes,
- keine Agent-Kommandos,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- `/dashboard` bleibt unveraendert,
- kein Webserver-Deploy noetig.
