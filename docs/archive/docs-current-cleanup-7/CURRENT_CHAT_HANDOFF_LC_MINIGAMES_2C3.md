# CURRENT CHAT HANDOFF – LC-MINIGAMES-2C3

Stand: 2026-06-16

## Projekt

```text
Repository: ForrestCGN/stream-control-center
Branch: dev
Lokal: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Backend: http://127.0.0.1:8080
Dashboard: http://127.0.0.1:8080/dashboard
DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Wichtige Arbeitsregeln

```text
Keine Funktionalität entfernen.
Keine produktive SQLite ersetzen/löschen/neu bauen.
Erst echte Dateien prüfen, dann ändern.
Vor Umsetzung Plan, dann Forrests go abwarten.
Dashboard streamer-/modfreundlich halten, nicht technisch überladen.
Keine doppelten Navigationswege, wenn vorhandene Tabs reichen.
```

## Aktueller Stand

```text
LC-MINIGAMES-2C3 FIX1 – Mini-Spiel-Auswahl kompakt, Raffle-Logs und Raffle-Statistik funktional geprüft.
Design-Feinschliff später.
```

## Loyalty Core

```text
Live-only aktiv.
/api/loyalty/status:
  mode=live
  enabled=true
  shadowMode=false
  pointsState=active
Shadow-Migration abgeschlossen.
Migration-Dry-Run: candidates=0 totalShadow=0.
```

## Raffle Logs

Dashboard:

```text
Loyalty -> Logs
Event = Raffle
```

Statusfilter:

```text
Alle
Bezahlt
Erstattet
Gewinn
Gestartet
Teilnahme
Beendet
Abgebrochen
```

Regel:

```text
Bei Punktebewegungen steht der betroffene User in der User-Spalte.
Bei Start/Abbruch steht der Auslöser in der User-Spalte.
Details erklären den Vorgang.
Technische IDs sind nur noch im Detaildialog relevant.
```

Historische Daten:

```text
Gewinne sind aus alten Transactions sichtbar.
Starts/Teilnahmen/Ende/Cancel sind historisch nur sichtbar, wenn aus Command-Logs oder neuen Raffle-Events rekonstruierbar.
Neue Raffles werden vollständiger geloggt.
```

## Raffle Statistik

Dashboard:

```text
Loyalty -> Mini-Spiele -> Raffle -> Statistik
```

Enthält:

```text
KPIs: Gestartet, Teilnahmen, Ausgezahlt, Erstattet
Sortierung: Gewinner, Teilnehmer, Starter, Gezahlte Gebühren
User-Auswahl: Alle User oder einzelner User
Tabelle: User, Gestartet, Teilnahmen, Gewinne, Gewonnen, Gezahlt, Erstattet
```

## Mini-Spiele Navigation

Aktueller funktionaler Stand:

```text
Mini-Spiele zeigt oben kompakte Spielauswahl-Chips/Kacheln.
Darunter erscheint nur das gewählte Spiel.
Raffle hat Übersicht/Statistik.
Gamble erscheint nur bei Auswahl Gamble.
Raffle Config bleibt in Einstellungen.
Raffle Texte bleiben in Texte.
Raffle Buchungen/Ereignisse bleiben in Logs.
```

## Offene Tests

```text
Raffle-Kosten vollständiger Live-Test:
- kostenloser Join
- kostenpflichtiger Join
- zu wenig Punkte
- Doppeljoin
- Cancel/Refund
- normaler Abschluss/Gewinn

Danach:
- Logs gegen tatsächlichen Ablauf prüfen.
- Statistik gegen Logs/Transactions prüfen.
```

## Letzte ZIPs / Steps

```text
LC_MINIGAMES_2C1_RAFFLE_LOGS_STATS.zip
LC_MINIGAMES_2C1_FIX1_RAFFLE_LOG_STATUS_USER.zip
LC_MINIGAMES_2C1_FIX2_RAFFLE_LOGS_COMPLETE_MAPPING.zip
LC_MINIGAMES_2C2_RAFFLE_STATS_USER_SORT.zip
LC_MINIGAMES_2C3_MINIGAMES_DETAIL_NAVIGATION.zip
LC_MINIGAMES_2C3_FIX1_MINIGAME_SELECTION_COMPACT.zip
```

## Nächster sinnvoller Step

```text
LC-MINIGAMES-2C4 Raffle Live-Test und ggf. kleine Korrekturen
```

Nicht direkt weiter am Design arbeiten, solange die Funktion noch nicht gegen einen echten Raffle-Lauf geprüft wurde.
