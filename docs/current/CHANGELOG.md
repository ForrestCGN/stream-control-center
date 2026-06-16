# CHANGELOG – stream-control-center

Stand: 2026-06-16

## 2026-06-16 – LC-MINIGAMES-2C3 FIX1 Mini-Spiel-Auswahl kompakt

### Ergebnis

```text
Die Mini-Spiele-Auswahl wurde von großen Vollbreiten-Karten auf kompakte Auswahl-Chips/Kacheln umgestellt. Darunter wird nur noch das ausgewählte Spiel angezeigt.
```

### Details

```text
Raffle und Gamble stehen nicht mehr als große Blöcke untereinander.
Das aktuell ausgewählte Spiel ist klar markiert.
Raffle/Gamble bleiben funktional auswählbar.
Design-Feinschliff wird später gemacht.
```

## 2026-06-16 – LC-MINIGAMES-2C3 Detail-Navigation Mini-Spiele

### Ergebnis

```text
Mini-Spiele zeigt nicht mehr gleichzeitig Gamble, Raffle und Raffle-Statistik untereinander. Es gibt eine Detail-Navigation: Auswahl des Spiels und darunter nur dessen Detailansicht.
```

### Raffle

```text
Raffle besitzt die Unteransichten Übersicht und Statistik.
Übersicht enthält Status, Teilnehmer, Gewinn, Dauer und Gewinnerregel.
Statistik enthält KPIs, Sortierung, User-Dropdown und Statistik-Tabelle.
```

## 2026-06-16 – LC-MINIGAMES-2C2 Raffle-Statistik

### Ergebnis

```text
Raffle-Statistik wurde auf der Raffle-Seite ergänzt. Sie ist nach Sortierung und User filterbar.
```

### Enthält

```text
KPIs: Gestartet, Teilnahmen, Ausgezahlt, Erstattet
Sortierung: Gewinner, Teilnehmer, Starter, Gezahlte Gebühren
User-Dropdown: Alle User oder einzelner User
Tabelle: User, Gestartet, Teilnahmen, Gewinne, Gewonnen, Gezahlt, Erstattet
```

### Hinweis

```text
Historische Raffle-Gewinne sind aus Transactions rekonstruierbar. Historische Starts/Teilnahmen sind nur sichtbar, wenn sie aus alten Command-Logs oder neuen Raffle-Events ableitbar sind.
```

## 2026-06-16 – LC-MINIGAMES-2C1 Raffle Logs

### Ergebnis

```text
Raffle ist als einzelner Event-Filter in der Log-Seite sichtbar. Die Raffle-Unterarten liegen im Statusfilter, nicht als Event-Dropdown-Chaos.
```

### Statusfilter

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

### User-/Details-Regel

```text
Bei Punktebewegungen zeigt User den betroffenen User.
Bei Start/Abbruch zeigt User den Auslöser.
Details beschreiben Vorgang, Zieluser, Betrag und Kontext.
```

## 2026-06-16 – LC-MINIGAMES-2C0 Raffle Navigation Cleanup

```text
Raffle-Config- und Raffle-Text-Sprungbuttons wurden aus der Raffle-Bedienansicht entfernt. Textkey-Chips wurden aus dem normalen Raffle-Statusbereich entfernt. Config bleibt im Tab Einstellungen, Texte bleiben im Tab Texte.
```

## 2026-06-16 – LC-CORE-LIVE-CLEANUP-3

```text
Loyalty-Status und Dashboard wurden auf Aktiv/Inaktiv bereinigt. mode=live, enabled=true, shadowMode=false, pointsState=active. streamElementsStillActive/importStatus stehen nicht mehr im normalen Hauptstatus.
```

## 2026-06-16 – LC-MINIGAMES-2B Raffle Teilnahmekosten und Text-Cleanup

```text
Raffle unterstützt backendseitig Teilnahmekosten. entryCostAmount=0 bedeutet kostenlos. entryCostAmount>0 setzt entryCostEnabled=true und soll beim Join Punkte abbuchen.
Alte aktive mehrzeilige Text-Sammelvarianten im Loyalty-Giveaways-/Mini-Spiel-Textbereich wurden bereinigt.
```

## Vorheriger Stand

Der vorherige Doku-Stand beschrieb LC-CORE-LIVE-CLEANUP-3 und Raffle-Kosten als offenen nächsten Test. Dieser Stand ergänzt die danach erfolgten Raffle-Log-/Statistik-/Navigation-Schritte.
