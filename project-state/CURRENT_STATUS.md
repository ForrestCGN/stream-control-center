# Current Status

Stand: 2026-06-28

Aktueller vorbereiteter Stand dieses Steps:

```text
0.2.10I - Modboard Online/Lokal Architekturregel dokumentiert
```

## Ergebnis

0.2.10I ist Doku-only. Es dokumentiert die beschlossene Zielarchitektur:

```text
Eine UI.
Zwei Zugangswege.
Ein Agent als zentraler Executor fuer Streaming-PC-Aktionen.
Synchronisierte User/Rechte zwischen Online und Lokal.
```

## Zugangsregel

```text
Mods:
immer https://mods.forrestcgn.de/

Forrest/Engel zuhause:
lokal am Streaming-PC/LAN ueber /dashboard-v2

Forrest/Engel unterwegs:
online ueber https://mods.forrestcgn.de/
```

## Agent-Regel

```text
Alles, was den Streaming-PC aktiv betrifft, laeuft am Ende ueber den Stream-PC-Agent.
```

Online:

```text
Modboard online -> Webserver -> Agent -> Streaming-PC-Aktion
```

Lokal:

```text
Dashboard-v2 lokal -> lokaler Server/Adapter -> Agent -> Streaming-PC-Aktion
```

## User/Rechte-Sync

```text
User/Rechte duerfen lokal und online geaendert werden.
Beide Seiten synchronisieren sich.
Sperren/Entzug von Rechten muessen online sofort wirken.
Der lokale Stand wird ueber den Agent nachgezogen, sobald verbunden.
```

## Bezug zu 0.2.10H

0.2.10H repariert die lokale Remote-Modboard-Anzeige ueber Asset-Pfade/Adapter. 0.2.10I aendert keinen Code, sondern legt fest, wie danach weiter geplant wird.

Nicht geaendert:

- keine Codeaenderung,
- keine DB-Migration,
- keine produktiven Writes,
- keine neuen Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- keine Aenderung an `/dashboard`,
- kein Webserver-Deploy noetig.
