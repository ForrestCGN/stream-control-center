# CURRENT STATUS – stream-control-center

Stand: 2026-06-08

## Aktueller Schwerpunkt

```text
Loyalty / CGN Gluecksrad / Giveaways Planung
```

## Neuer Stand

```text
STEP LWG-3.1 – Dashboard Loyalty Main Section Bridge
```

## Umgesetzt

```text
- Loyalty ist als eigener Dashboard-Hauptbereich vorbereitet.
- Loyalty Games liegt unter Loyalty.
- LWG-3 Read-only-Dashboard bleibt erhalten.
- Keine Backend-/DB-/API-Aenderung.
```

## Architekturentscheidung

```text
Loyalty wird Hauptbereich fuer Punkte, Giveaways, Spiele, Gluecksrad, Presets, Rewards und Diagnose.
Kommunikation zwischen Loyalty-Untermodulen soll ueber EventBus/definierte Events laufen.
```
