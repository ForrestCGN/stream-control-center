# CHANGELOG – stream-control-center

Stand: 2026-06-11

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
