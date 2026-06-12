# CHANGELOG – stream-control-center

Stand: 2026-06-12

## 2026-06-12 – LWG-4Q.12N Final Gamble/Giveaways Cleanup Docs

### Ergebnis

```text
Doku/TODO/NEXT_STEPS/FILES/CURRENT_STATUS auf aktuellen Stand gebracht.
Prompt für neuen Chat erstellt.
Giveaways-/Gamble-Stand konsolidiert.
```

## 2026-06-12 – LWG-4Q.12M Gamble Config Cleanup

### Ergebnis

```text
Gamble-Config-UI an einfache Gewinn-/Verlustlogik angepasst.
Auszahlung x aus UI entfernt.
Gamble-Cooldown pro User aus UI entfernt.
Gamble-Cooldown global aus UI entfernt.
Command-Cooldown pro User bleibt sichtbar.
Engine-Cooldown wird beim Dashboard-Speichern intern auf 0 gesetzt.
payoutMultiplier wird intern auf 2 gesetzt.
```

### Zielmodell

```text
Command-System = !gamble aktiv/aus + Cooldown
Gamble-Engine = Gewinn/Verlust berechnen
```

## 2026-06-12 – LWG-4Q.12L Gamble Simple Win/Loss Logic

### Ergebnis

```text
Gamble-Engine rechnet nicht mehr mit sichtbarer Payout-Logik.
Gewinn = Einsatz dazu.
Verlust = Einsatz weg.
Gilt für feste Einsätze und Prozent-Einsätze.
```

## 2026-06-12 – LWG-4Q.12K Gamble Single Text Variant Fix

### Ergebnis

```text
Mehrzeilige Legacy-/Variantentexte werden nicht mehr als eine lange Chatnachricht ausgegeben.
Pro Gamble-Ergebnis wird genau eine nicht-leere Textzeile/Variante verwendet.
```

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

## 2026-06-12 – STEP235S Final Gamble Config Cleanup

### Ergebnis

```text
Gamble-Config-Cleanup im Loyalty-Dashboard abgeschlossen.
Actor-/Rollenfelder aus normaler UI entfernt.
Rechte-/Session-Anbindung nur vorbereitet.
Cooldowns wurden damals noch in Sekunden angezeigt und intern in ms gespeichert.
Nach LWG-4Q.12M gilt: sichtbarer Gamble-Cooldown nur noch über Command-System.
```
