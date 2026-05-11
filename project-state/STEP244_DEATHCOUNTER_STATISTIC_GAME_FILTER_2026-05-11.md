# STEP244 - DeathCounter Statistik Game-Filter

Stand: 2026-05-11

## Ziel

DeathCounter Statistik im Dashboard kann jetzt nach Spielen gefiltert werden.

## Geändert

```text
htdocs/dashboard/modules/deathcounter.js
htdocs/dashboard/modules/deathcounter.css
```

## Funktion

- Statistik-Tab hat ein Dropdown `Spiel auswählen`.
- Optionen:
  - Aktuelles Spiel
  - Alle Spiele / AllTime
  - alle Spiele aus dem vorhandenen JSON-State (`player.games`).
- KPIs, Toplisten und Spielerwert-Tabelle reagieren auf die Auswahl.
- Keine Backend-Abfrage oder DB-Migration nötig; die vorhandenen State-Daten werden clientseitig ausgewertet.

## Bewusst nicht geändert

```text
backend/modules/deathcounter_v2.js
app.sqlite
data/deathcounter/deathcounter.v2.json
DeathCounter Overlay
Streamer.bot Actions
```

## Tests

```text
node --check htdocs/dashboard/modules/deathcounter.js
```

Browser-Test:

```text
Dashboard -> Community -> DeathCounter -> Statistik
```

Prüfen:

```text
- Dropdown zeigt Aktuelles Spiel / Alle Spiele / einzelne Spiele
- KPIs ändern sich nach Auswahl
- Toplisten ändern sich nach Auswahl
- Spielerwerte-Tabelle zeigt Werte zum gewählten Spiel
```
