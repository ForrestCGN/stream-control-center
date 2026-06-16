# CHANGELOG – stream-control-center

Stand: 2026-06-16

## 2026-06-16 – LC-MINIGAMES-2B FIX3 Text DB Cleanup

### Ergebnis

```text
Alte aktive mehrzeilige Text-Sammelvarianten im Loyalty-Giveaways-/Mini-Spiel-Textbereich wurden bereinigt. Die Prüfung auf aktive Varianten mit Zeilenumbrüchen liefert keine Ausgabe mehr.
```

### Betroffene Bereiche

```text
chat_raffle
chat_giveaway
chat_ticket
chat_wheel
```

### Wichtig

```text
Texte laufen weiterhin über helper_texts.renderModuleText(...).
Keine eigene Zufallslogik wurde gebaut.
Alte raffle.* Seed-Keys wurden aus dem aktiven Pfad entfernt/bereinigt.
Produktiver Raffle-Pfad nutzt raffle.public.*.
```

## 2026-06-16 – LC-MINIGAMES-2B Raffle Teilnahmekosten

### Ergebnis

```text
Raffle unterstützt backendseitig Teilnahmekosten. entryCostAmount=0 bedeutet kostenlos. entryCostAmount>0 setzt entryCostEnabled=true und soll beim Join Punkte abbuchen.
```

### Bestätigt

```text
/api/loyalty/raffle/config speichert entryCostAmount=10 und entryCostEnabled=true korrekt.
```

### Offen

```text
Live-Test mit !raffle / !join bei genug Punkten, zu wenig Punkten, Doppeljoin, Cancel/Refund und normalem Abschluss.
```

## 2026-06-16 – LC-MINIGAMES-2A Dashboard Cleanup

### Ergebnis

```text
Mini-Spiele wurde als Status-/Bedienseite bereinigt. Raffle-Config liegt unter Loyalty -> Einstellungen -> Raffle. Raffle-Texte liegen unter Loyalty -> Texte -> Raffle.
```

### Details

```text
Einstellungen -> Raffle zeigt nur fachliche Config.
Command-Felder wurden aus Raffle-Config entfernt.
Texte-Dropdown hat keine Option Alle Textbereiche mehr.
Textvarianten-Tabelle zeigt nur noch den ausgewählten Bereich.
```

## 2026-06-15/16 – StreamElements Import Hinweis

```text
Beim StreamElements-Punkteimport wurden die StreamElements-Punkte in die Datenbank importiert, aber Punkte, die im neuen Loyalty-System bereits gesammelt wurden, wurden dabei nicht addiert. Das ist für spätere Prüfungen/Korrekturen relevant.
```

## Vorheriger Stand

Der vorherige Doku-Stand beschrieb LC-CORE-POINTS-3A als nächsten Hauptblock. Dieser bleibt weiterhin geplant, wird aber nach Abschluss des Raffle-Kosten-Live-Tests fortgesetzt.
