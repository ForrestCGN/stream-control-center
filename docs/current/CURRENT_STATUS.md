# CURRENT_STATUS – stream-control-center

Stand: 2026-06-16

## Aktueller bestätigter Arbeitsstand

```text
LC-MINIGAMES-2C3 FIX1 – Mini-Spiel-Auswahl kompakt, Raffle-Logs und Raffle-Statistik funktional geprüft
Design-Feinschliff später
```

## Kurzfazit

Der Loyalty-Core läuft produktiv im Live-only-Betrieb. Shadow ist leer und fachlich nicht mehr Teil des normalen Betriebs. Das Dashboard ist im Loyalty-Bereich auf Aktiv/Inaktiv ausgerichtet.

Der Mini-Spiele-Bereich wurde nach dem Raffle-/Gamble-Ausbau wieder entschlackt: Es gibt oben eine kompakte Spielauswahl statt großer Vollbreiten-Karten, darunter wird nur noch das ausgewählte Spiel angezeigt. Raffle hat eine eigene Unteransicht mit `Übersicht` und `Statistik`.

Bestätigt:

```text
Loyalty Core läuft produktiv.
/api/loyalty/status meldet mode=live, enabled=true, shadowMode=false, pointsState=active.
Shadow-Migration ist abgeschlossen: candidates=0 totalShadow=0.
Raffle-Logs sind unter Loyalty -> Logs über Event=Raffle sichtbar.
Raffle-Statusfilter sind verständlich: Bezahlt, Erstattet, Gewinn, Gestartet, Teilnahme, Beendet, Abgebrochen.
Raffle-Statistik sitzt auf der Raffle-Seite und ist nach User/Sortierung filterbar.
Mini-Spiele-Seite zeigt nicht mehr Gamble + Raffle + Statistik untereinander.
```

## Loyalty Live-only / Shadow-Migration

### Abschlussprüfung

```text
node .\tools\loyalty_migrate_shadow_to_live_once.js --dry-run
```

Ergebnis:

```text
candidates=0 totalShadow=0
excluded=0 excludedShadow=0
Keine User mit balanceShadow > 0 gefunden.
```

### Wichtige Referenzwerte

```text
Urlug:
  balanceShadow = 0
  balanceLive   = 1006852
  activeBalance = 1006852
  activeMode    = live

Tronic6:
  balanceShadow = 0
  balanceLive   = 12536
  activeBalance = 12536
  activeMode    = live
```

## Betriebslogik ab jetzt

Fachlich gibt es im Loyalty-Core nur noch:

```text
Aktiv   = live
Inaktiv = off
```

`shadowMode` bleibt aus Kompatibilitätsgründen vorerst als API-Feld vorhanden, ist aber `false`. Alte `mode=shadow`-Werte sollen im Runtime-Pfad nicht mehr zu Shadow-Buchungen führen.

## Status Live-System

Bestätigte Statuswerte aus `/api/loyalty/status` nach Cleanup-3:

```text
module = loyalty
version = 0.1.24
mode = live
enabled = true
shadowMode = false
pointsState = active
currencyName = Kekskrümel
schema.version = 4
```

Bestätigt: Die alten Hauptstatusfelder `streamElementsStillActive` und `importStatus` sind im normalen Status nicht mehr vorhanden. Legacy-Infos bleiben nur im Diagnosebereich `diagnostics.legacyFallbacks`.

## Raffle / Mini-Spiele – bestätigter Stand

```text
backend/modules/loyalty_giveaways.js
moduleVersion = 0.1.14
moduleBuild = STEP_LC_MINIGAMES_2C1_FIX1_RAFFLE_LOG_STATUS_USER
```

Spätere Dashboard-only-Fixes seitdem:

```text
LC-MINIGAMES-2C1-FIX2 Raffle-Logs vollständiger gemappt
LC-MINIGAMES-2C2 Raffle-Statistik mit User-Sortierung
LC-MINIGAMES-2C3 Mini-Spiele Detail-Navigation
LC-MINIGAMES-2C3-FIX1 Mini-Spiel-Auswahl kompakt
```

Bestätigte Raffle-Routen:

```text
GET  /api/loyalty/raffle/status
GET  /api/loyalty/raffle/config
POST /api/loyalty/raffle/config
GET  /api/loyalty/raffle/logs
GET  /api/loyalty/raffle/stats
GET  /api/loyalty/giveaways/raffle/status   Kompatibilität
```

## Raffle-Logs

Die Log-Seite ist für Buchungen und Ereignisse zuständig:

```text
Loyalty -> Logs
Event = Raffle
```

Statusfilter bei Raffle:

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

Wichtige Log-Regel:

```text
Bei Punktebewegungen steht in der User-Spalte der betroffene User.
Bei Start/Abbruch steht in der User-Spalte der auslösende Mod/Streamer/System-User.
Details erklären den Vorgang verständlich.
Technische IDs stehen nicht mehr direkt in der Tabelle, sondern im Detaildialog.
```

Für alte Raffles sind historische Gewinne über vorhandene Transactions sichtbar. Start/Teilnahme/Beendet/Abgebrochen können nur angezeigt werden, wenn sie historisch aus vorhandenen Command-Logs oder neuen Raffle-Events rekonstruierbar sind. Ab dem neuen Stand werden neue Raffle-Ereignisse sauberer gespeichert.

## Raffle-Statistik

Die Statistik gehört auf die Raffle-Seite:

```text
Loyalty -> Mini-Spiele -> Raffle -> Statistik
```

Bestätigter Inhalt:

```text
KPIs:
- Gestartet
- Teilnahmen
- Ausgezahlt
- Erstattet

Sortierung:
- Gewinner
- Teilnehmer
- Starter
- Gezahlte Gebühren

User-Filter:
- Alle User
- einzelner User

Tabelle:
- User
- Gestartet
- Teilnahmen
- Gewinne
- Gewonnen
- Gezahlt
- Erstattet
```

Hinweis: Bei alten Raffles sind Gewinnsummen zuverlässig vorhanden; historische Starts und Teilnahmen sind nur teilweise rekonstruierbar. Neue Raffles werden ab dem aktuellen Stand vollständiger geloggt.

## Mini-Spiele-Dashboard

Aktueller bestätigter UX-Stand:

```text
Mini-Spiele zeigt oben eine kompakte Spielauswahl.
Raffle und Gamble erscheinen als kleine Auswahl-Chips/Kacheln.
Nur das aktuell gewählte Spiel wird darunter angezeigt.
Raffle hat die Unteransichten Übersicht und Statistik.
Gamble wird nur angezeigt, wenn Gamble ausgewählt ist.
Config und Texte bleiben in den eigenen Tabs Einstellungen bzw. Texte.
Logs bleiben im Tab Logs.
```

Design-Feinschliff ist bewusst zurückgestellt. Funktionalität ist wichtiger als weitere optische Nacharbeit in diesem Schritt.

## Raffle-Config

Aktuell fachlich relevante Config:

```text
enabled
liveOnly
durationSeconds
maxDurationSeconds
prizePoolAmount
entryCostAmount
entryCostEnabled
showPoolInChat = false
```

Command-Felder werden nicht mehr im Raffle-Config-Bereich bearbeitet. Sie bleiben intern erhalten und gehören langfristig nach `Loyalty -> Chat & Befehle` bzw. in das zentrale Command-Modul.

## Teilnahmekosten

Teilnahmekosten wurden backendseitig eingebaut:

```text
entryCostAmount = 0  -> kostenlos
entryCostAmount > 0  -> entryCostEnabled=true, Join soll Punkte abbuchen
```

Bestätigt:

```text
POST/GET /api/loyalty/raffle/config speichert entryCostAmount=10 und entryCostEnabled=true korrekt.
```

Noch separat sauber zu prüfen:

```text
Kostenpflichtiger Join bei genug Punkten
Join bei zu wenig Punkten
Doppeljoin ohne zweite Abbuchung
Cancel/Refund bezahlter Teilnahmen
Normaler Ablauf mit Auszahlung ohne Erstattung
```

## Textsystem / Cleanup

Raffle/Giveaway/Ticket/Wheel-Texte laufen weiter über den vorhandenen Helper:

```text
backend/modules/helpers/helper_texts.js
helper_texts.renderModuleText(...)
```

Keine eigene Zufallslogik wurde gebaut.

Bestätigt:

```text
Alte aktive mehrzeilige Sammelvarianten wurden für loyalty_giveaways Textbereiche bereinigt.
Prüfung auf aktive Varianten mit Zeilenumbrüchen lieferte keine Ausgabe.
Raffle nutzt produktiv neue Keys raffle.public.*.
Alte raffle.* Seed-Keys wurden aus dem aktiven Pfad entfernt/bereinigt.
```

## Nicht geändert

```text
Keine produktive SQLite ersetzt.
Keine Transaktionen gelöscht.
Keine Raffle-Gewinnerregel geändert.
Keine Command-Registry umgebaut.
Keine Alert-Produktivumschaltung.
Keine neue Raffle-Parallelstruktur gebaut.
DB-Spalten balance_shadow, total_earned_shadow, total_spent_shadow wurden noch nicht gedroppt.
Diagnose-Legacyfelder unter diagnostics wurden nicht entfernt.
Design-Feinschliff im Mini-Spiele-Bereich wurde bewusst verschoben.
```
