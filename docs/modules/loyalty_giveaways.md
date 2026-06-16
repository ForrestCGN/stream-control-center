# Modul-Doku – Loyalty Giveaways / Mini-Spiele

Stand: 2026-06-16

## Zweck

`backend/modules/loyalty_giveaways.js` verwaltet Giveaways, Tickets, Wheel-Claims und die aktuelle Raffle-Funktion. Raffle bleibt bewusst im bestehenden Modul und wird nicht als Parallelstruktur neu aufgebaut.

## Aktueller Stand

```text
moduleName = loyalty_giveaways
moduleVersion = 0.1.14
moduleBuild = STEP_LC_MINIGAMES_2C1_FIX1_RAFFLE_LOG_STATUS_USER
```

Spätere Dashboard-only-Fixes:

```text
LC-MINIGAMES-2C1-FIX2 Raffle-Logs vollständiger gemappt
LC-MINIGAMES-2C2 Raffle-Statistik mit User-Sortierung
LC-MINIGAMES-2C3 Mini-Spiele Detail-Navigation
LC-MINIGAMES-2C3-FIX1 Mini-Spiel-Auswahl kompakt
```

## Wichtige Routen

```text
GET  /api/loyalty/giveaways/status
GET  /api/loyalty/giveaways/texts
GET  /api/loyalty/giveaways/commands
GET  /api/loyalty/giveaways/raffle/status
GET  /api/loyalty/raffle/status
GET  /api/loyalty/raffle/config
POST /api/loyalty/raffle/config
GET  /api/loyalty/raffle/logs
GET  /api/loyalty/raffle/stats
```

## Raffle-Funktion

Raffle wird über die bestehenden Chat-Commands gesteuert:

```text
!raffle
!raffle status
!raffle cancel / stop / abbrechen
!join
```

Die Commands werden perspektivisch zentral über das Command-Modul verwaltet. Die Raffle-Config-Seite bearbeitet keine Command-Felder mehr.

## Raffle-Config

Fachlich relevante Felder:

```text
enabled
liveOnly
durationSeconds
maxDurationSeconds
prizePoolAmount
entryCostAmount
entryCostEnabled
showPoolInChat
```

Wichtige Regeln:

```text
entryCostAmount = 0  -> kostenlos
entryCostAmount > 0  -> entryCostEnabled=true und Join bucht Kosten
showPoolInChat = false bleibt bestätigt
```

## Gewinnerregel

```text
1 Teilnehmer      -> 1 Gewinner
2–10 Teilnehmer   -> Hälfte der Teilnehmer, abgerundet
11–20 Teilnehmer  -> 1 Gewinner je 4 Teilnehmer
21–50 Teilnehmer  -> 1 Gewinner je 5 Teilnehmer
51–200 Teilnehmer -> 1 Gewinner je 8 Teilnehmer
201+ Teilnehmer   -> 1 Gewinner je 20 Teilnehmer
```

## Raffle-Auszahlung

```text
Interner Gesamtgewinn: 5000 Kekskrümel
Auszahlung pro Gewinner: floor(5000 / winnerCount)
Rest bleibt unvergeben
Transaction type/reason für Gewinn: raffle_win / loyalty_raffle_win
sourceModule: loyalty_giveaways
sourceProvider: raffle
mode: live
```

## Raffle-Teilnahmekosten

Bei kostenpflichtiger Teilnahme:

```text
Genug Punkte -> Teilnahme wird eingetragen, Kosten werden gebucht.
Zu wenig Punkte -> keine Teilnahme, keine Abbuchung, Text via helper_texts.
Doppeljoin -> keine zweite Abbuchung.
Cancel -> bezahlte Teilnahmen werden erstattet.
Normaler Abschluss -> keine Erstattung, Gewinner erhalten Auszahlung.
```

Offen ist der komplette Live-Test dieser Fälle.

## Raffle Logs

Logs werden im Dashboard unter `Loyalty -> Logs` angezeigt:

```text
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

User-/Details-Regel:

```text
Bei Punktebewegungen zeigt User den betroffenen User.
Bei Start/Abbruch zeigt User den Auslöser.
Details beschreiben den Vorgang und enthalten bei Bedarf Zieluser/Betrag/Kontext.
```

Historische Daten:

```text
Alte Gewinne sind aus Loyalty-Transactions rekonstruierbar.
Historische Starts/Teilnahmen/Ende/Cancel sind nur sichtbar, wenn vorhandene Command-Logs oder neue Events es hergeben.
Neue Raffles werden vollständiger in loyalty_raffle_events bzw. über neue Log-Mappings abgebildet.
```

## Raffle Statistik

Statistik sitzt auf der Raffle-Seite:

```text
Loyalty -> Mini-Spiele -> Raffle -> Statistik
```

Angezeigt werden:

```text
KPIs:
- Gestartet
- Teilnahmen
- Ausgezahlt
- Erstattet

Tabelle pro User:
- User
- Gestartet
- Teilnahmen
- Gewinne
- Gewonnen
- Gezahlt
- Erstattet
```

Filter/Sortierung:

```text
Sortierung: Gewinner, Teilnehmer, Starter, Gezahlte Gebühren
User: Alle User oder einzelner User
```

## Dashboard-Struktur

Aktuell verbindlich:

```text
Mini-Spiele = kompakte Spielauswahl + Detail des gewählten Spiels.
Raffle-Übersicht = Status, Teilnehmer, Gewinn, Dauer, Gewinnerregel.
Raffle-Statistik = eigener Unterbereich innerhalb Raffle.
Raffle-Config = Tab Einstellungen.
Raffle-Texte = Tab Texte.
Raffle-Logs = Tab Logs.
```

Nicht wieder einführen:

```text
Raffle-Konfigurieren-/Texte-Buttons im normalen Raffle-Bedienbereich.
Textkey-Chips in der normalen Raffle-Statusseite.
Technische Raffle-Unterevents als einzelne Event-Dropdown-Einträge.
Gamble + Raffle + Statistik wieder als lange Seite untereinander.
```

## Textsystem

Alle Chattexte laufen über:

```text
backend/modules/helpers/helper_texts.js
helper_texts.renderModuleText(...)
```

Produktive Raffle-Keys:

```text
raffle.public.started
raffle.public.started_paid
raffle.public.already_active
raffle.public.joined
raffle.public.joined_paid
raffle.public.insufficient_balance
raffle.public.already_joined
raffle.public.no_active
raffle.public.status
raffle.public.cancelled
raffle.public.no_entries
raffle.public.winners
raffle.public.permission_denied
```

Alte `raffle.*` Seed-Keys sollen nicht wieder als produktiver Pfad genutzt werden.

## Nicht geändert

```text
Keine produktive SQLite ersetzt.
Keine Transaktionen gelöscht.
Keine Gewinnerregel geändert.
Keine Command-Registry umgebaut.
Keine neue Raffle-Parallelstruktur gebaut.
```
