# STEP247 - DeathCounter Spieler-Detailansicht im Dashboard

Stand: 2026-05-11

## Ziel

DeathCounter-Dashboard im Spieler-Tab um eine praktische Detailansicht pro Spieler erweitern.

## Geändert

```text
htdocs/dashboard/modules/deathcounter.js
htdocs/dashboard/modules/deathcounter.css
```

## Inhalt

- Spieler-Tab zeigt weiterhin Suche, Sortierung und Spielerliste.
- Neue Detailauswahl pro Spieler über Dropdown und Details-Button in der Tabelle.
- Detailkarte zeigt pro ausgewähltem Spieler:
  - Heute im aktuellen Spiel
  - Spiel gesamt im aktuellen Spiel
  - Session gesamt
  - AllTime gesamt
  - Tabelle aller gespeicherten Spiele dieses Spielers
- Aktuelles Spiel wird in der Spieltabelle markiert.

## Bewusst nicht geändert

```text
backend/modules/deathcounter_v2.js
backend/modules/twitch.js
app.sqlite
data/deathcounter/deathcounter.v2.json
htdocs/overlays/_overlay-deathcounter-v2.html
Streamer.bot Actions/Exports
```

## Test

```text
node --check htdocs/dashboard/modules/deathcounter.js
```

Dashboard prüfen:

```text
Community -> DeathCounter -> Spieler
```

Erwartung:

```text
- Spieler-Suche funktioniert weiter
- Spieler-Sortierung funktioniert weiter
- Details-Button wählt Spieler aus
- Detail-Dropdown wählt Spieler aus
- Detailkarte zeigt alle Spiele des Spielers
- aktuelles Spiel ist markiert
```
