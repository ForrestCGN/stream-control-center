# CHANGELOG – stream-control-center

Stand: 2026-06-12

## 2026-06-12 – LWG-4Q.12J Final Giveaways UI Cleanup

### Ergebnis

```text
Giveaways-Dashboard-Cleanup abgeschlossen.
Tabs bleiben beim Wechsel in Giveaways vollständig sichtbar.
Gamble und Config wurden in der Giveaways-Tab-Leiste wieder ergänzt.
Nicht mehr erreichbarer Legacy-Giveaway-Code wurde aus loyalty_games.js entfernt.
```

### Bestätigte Korrekturen

```text
LWG-4Q.12G Redirect Legacy Giveaway Wheel Editor
LWG-4Q.12H Remove Legacy Giveaway Code From Loyalty Games
LWG-4Q.12I Unified Loyalty Tabs In Giveaways
LWG-4Q.12J Abschluss-Doku
```

### Neue Zielstruktur

```text
loyalty_games.js      → Games, Glücksrad, Presets, Gamble, Config
loyalty_giveaways.js  → Giveaways, Wheel-Editor, Live-Steuerung
```

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

## 2026-06-11 – LWG-4Q.11 Manual Winner Flow and Prize Quantity Cleanup

### Ergebnis

```text
Normale Giveaways enden nicht mehr automatisch nach Gewinneranzahl.
Der Streamer entscheidet live über „Weiteren Gewinner auslosen“ und „Beenden“.
Gewinneranzahl und Gewinn-Menge wurden aus dem geplanten Formular-Flow entfernt.
Glücksrad-Giveaways enden, wenn keine nutzbaren Wheel-Gewinne/Felder mehr vorhanden sind.
```
