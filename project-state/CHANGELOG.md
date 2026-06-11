# CHANGELOG – stream-control-center

Stand: 2026-06-11

## 2026-06-11 – STEP211 / LWG-5.3 Documentation Handoff

### Geändert

```text
docs/modules/README.md
docs/modules/loyalty.md
docs/modules/loyalty_games.md
docs/current/CURRENT_CHAT_HANDOFF_STEP211_LWG5_3.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

### Ergebnis

```text
Dokumentation für STEP209 / STEP210 aktualisiert.
Loyalty Safety Layer dokumentiert.
Gamble Prepared dokumentiert.
Regel „Module aktiv, Commands separat deaktiviert“ festgehalten.
Nächster Schritt STEP212 / LWG-5.4 festgelegt.
```

### Keine Runtime-Änderung

```text
Keine JS-Dateien geändert.
Keine Modulversion erhöht.
Keine Datenbank geändert.
Keine Chat-Commands aktiviert.
```

## 2026-06-11 – STEP210 / LWG-5.2 Status Cleanup

### Geändert

```text
backend/modules/loyalty.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
```

### Ergebnis

```text
API-/Statusfelder für Tests und Dashboard bereinigt.
rank.rankTotal zusätzlich als rank.total geplant/ergänzt.
can-afford amount zusätzlich als required geplant/ergänzt.
Gamble-Status trennt Modul-/Game-/Command-Zustand klarer.
Module bleiben aktiv/online; Commands bleiben separat deaktiviert.
```

### Versionen

```text
loyalty.js: 0.1.13 / STEP210
loyalty_games.js: 0.2.2 / STEP_LWG_5_2_STATUS_CLEANUP
```

## 2026-06-11 – STEP209 / LWG-5.1 Loyalty Safety Layer + Gamble vorbereitet

### Geändert

```text
backend/modules/loyalty.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
```

### Ergebnis

```text
Zentrale Safety-Funktionen für verfügbare Kekskrümel vorbereitet.
Reservierungen vorbereitet.
Ranking nach verfügbaren Kekskrümeln vorbereitet.
Points Commands vorbereitet, aber deaktiviert.
Gamble vorbereitet, aber deaktiviert.
DB-Multitexte im CGN-/Altersheim-/Heimleitung-/Rentner-Stil vorbereitet.
```

### Bestätigte Tests

```text
Loyalty-Status erreichbar.
Loyalty-Games-Status erreichbar.
Commands gamble/punkte/givepoints/setpoint sind disabled.
Available Balance für forrestcgn: 3400 verfügbar, Rang 2.
Can-Afford mit 9999999 blockiert korrekt.
Gamble Play bei disabled: HTTP 403 gamble_disabled.
```

## 2026-06-11 – LWG-4Q.11 Manual Winner Flow and Prize Quantity Cleanup

### Geändert

```text
backend/modules/loyalty_giveaways.js
backend/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_giveaways.css
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/index.html
```

### Ergebnis

```text
Normale Giveaways enden nicht mehr automatisch nach Gewinneranzahl.
Der Streamer entscheidet live über „Weiteren Gewinner auslosen“ und „Beenden“.
Gewinneranzahl und Gewinn-Menge wurden aus dem geplanten Formular-Flow entfernt.
Glücksrad-Giveaways enden, wenn keine nutzbaren Wheel-Gewinne/Felder mehr vorhanden sind.
```

### Bestätigt

```text
Test_LWG_4Q11_manual_winner_flow_ForrestCGN.ps1
ModuleBuild: STEP_LWG_4Q_11
=== TEST OK: Alle aktivierten Szenarien erfolgreich ===
```

## 2026-06-11 – LWG-4Q.10 / 4Q.10a / 4Q.10b Formular-UX Cleanup

### Ergebnis

```text
Rundenmodus und Ticket-Übernahme sollten aus der UI verschwinden.
Chat-Claim-Zusatzfelder sollten nur sichtbar sein, wenn Chat-Claim aktiv ist.
Cache-Busting und hidden-Visibility-Fixes wurden ergänzt.
```

### Status

```text
API-Flows bestätigt.
UI nach 4Q.10b/4Q.11 noch nicht vollständig sauber bestätigt.
```

## 2026-06-11 – LWG-4Q.9 / 4Q.9a Delete / Archive

### Ergebnis

```text
Archivieren nur bei finished.
Löschen = echtes Hard-Delete.
Hard-Delete-Transaction-Ausführung repariert.
```

### Bestätigt

```text
Test_LWG_4Q9_delete_archive_rules_ForrestCGN.ps1
=== TEST OK ===
```

## 2026-06-11 – LWG-4Q.8 Routing / Modal Wheel Editor Ansatz

### Ergebnis

```text
Ziel war, altes Giveaway-UI aus sichtbarem Flow zu verdrängen.
Neues Giveaway-Control soll Single Source für Giveaways werden.
Glücksrad erstellen/bearbeiten soll aus dem neuen Giveaway-Control kommen.
```

### Status

```text
Routing muss in UI noch final sauber geprüft werden.
```

## 2026-06-11 – Qualitätshinweis

Die UI-assisted Scripts nach 4Q.11 waren nicht sauber genug. Sie sollten nicht als belastbarer Teststandard verwendet werden. Künftige UI-Prüfungen bitte klein, einzeln und manuell bestätigt halten.
