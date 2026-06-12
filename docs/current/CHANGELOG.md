# CHANGELOG – stream-control-center

Stand: 2026-06-12

## 2026-06-12 – STEP235S Final Gamble Config Cleanup

### Ergebnis

```text
Gamble-Config-Cleanup im Loyalty-Dashboard final abgeschlossen.
Actor-/Rollenfelder aus normaler UI entfernt.
Rechte-/Session-Anbindung nur vorbereitet.
Cooldowns werden in Sekunden angezeigt und intern weiter in ms gespeichert.
Gamble-Config-Labels verständlicher gemacht.
Backend/API/DB/Audit unverändert.
```

### Bestätigte Teilsteps

```text
STEP235H Config UX Standard
STEP235J Remove Standalone Gamble Dashboard
STEP235M Remove Loyalty Runtime Shell Fallback
STEP235P Gamble Actor Fields Prepared
STEP235R Gamble Cooldown UX Cleanup
STEP235S Final Gamble Config Cleanup
```

### Aktiver Zielpfad

```text
/dashboard
Loyalty → Gamble
Loyalty → Config → Gamble
```

### Nicht mehr verwenden

```text
STEP232-Gamble-Shell-Integration
loyalty-gamble.html
loyalty-gamble.js
loyalty-gamble.css
loyalty-gamble-nav.js
loyalty-gamble-shell-card.js
loyalty-gamble-shell-card.css
```

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

## 2026-06-11 – LWG-4Q.11 Manual Winner Flow and Prize Quantity Cleanup

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

## 2026-06-11 – Qualitätshinweis

Die UI-assisted Scripts nach 4Q.11 waren nicht sauber genug. Sie sollten nicht als belastbarer Teststandard verwendet werden. Künftige UI-Prüfungen bitte klein, einzeln und manuell bestätigt halten.
