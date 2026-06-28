# Lokaler Dashboard-Ersatz - aktueller Plan

Stand: 2026-06-28

## Aktueller Stand

```text
0.2.10I - Modboard Online/Lokal Architekturregel dokumentiert
```

0.2.10H hat die Remote-Asset-Pfade fuer `/dashboard-v2` repariert. 0.2.10I ist Doku-only und haelt die Architekturentscheidung fest.

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

## 0.2.10H

0.2.10G zeigte nacktes HTML, weil die echte Remote-Modboard-App `/assets/...` referenziert, der lokale Server aber `/assets` auf `htdocs/assets` mappt.

0.2.10H repariert das ueber den lokalen Adapter:

```text
/assets/remote-modboard.css
/assets/remote-modboard.js
/assets/runtime-profile.js
/assets/languages/*
/assets/modules/*
/dashboard-v2/assets/*
```

Wenn lokale Remote-Modboard-Assets vorhanden sind, werden sie lokal geliefert. Wenn nicht, wird auf `https://mods.forrestcgn.de/assets/...` weitergeleitet.

## Sicherheitsgrenzen

- keine zweite lokale UI,
- keine DB-Migration in 0.2.10I,
- keine produktiven Writes in 0.2.10I,
- keine neuen Agent-Actions in 0.2.10I,
- keine OBS-/Sound-/Overlay-/Command-Steuerung in 0.2.10I,
- keine Shell-/Datei-/Prozess-Actions,
- `/dashboard` bleibt unveraendert,
- kein Webserver-Deploy fuer Doku-only.
