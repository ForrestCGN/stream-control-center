# CHANGELOG – stream-control-center

Stand: 2026-06-12

## 2026-06-12 – STEP235 Final Loyalty Dashboard Cleanup

### Ergebnis

```text
Dashboard-Shell für Loyalty stabilisiert.
Gamble in Loyalty integriert.
Config-UX für Gamble bereinigt.
Standalone-Gamble entfernt.
STEP232-/Gamble-Shell-Reste bereinigt.
Runtime-Shell-Fallback aus loyalty_games.js entfernt.
Doku-/Status-Dateien aktualisiert.
```

### Bestätigte Commits

```text
518dd6e4 STEP235M Remove Loyalty Runtime Shell Fallback
9ab5e619 STEP235J Remove Standalone Gamble Dashboard
0b44d8f6 STEP235H Config UX Standard
```

### Aktiver Zielpfad

```text
/dashboard
Loyalty → Gamble
Loyalty → Config → Gamble
```

### Entfernte Altlasten

```text
htdocs/dashboard/loyalty-gamble.html
htdocs/dashboard/modules/loyalty-gamble.js
htdocs/dashboard/modules/loyalty-gamble.css
```

Nicht mehr verwenden:

```text
loyalty-gamble-nav.js
loyalty-gamble-shell-card.js
loyalty-gamble-shell-card.css
STEP232-Gamble-Shell-Integration
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
UI nach 4Q.10b/4Q.11 muss weiterhin nur klein und einzeln geprüft werden.
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

## 2026-06-11 – Qualitätshinweis

Die UI-assisted Scripts nach 4Q.11 waren nicht sauber genug. Sie sollten nicht als belastbarer Teststandard verwendet werden. Künftige UI-Prüfungen bitte klein, einzeln und manuell bestätigt halten.
