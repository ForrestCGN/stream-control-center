# CHANGELOG – stream-control-center

Stand: 2026-06-16

## 2026-06-16 – LC-CORE-LIVE-CLEANUP-3 Status/Dashboard Aktiv-Inaktiv

### Ergebnis

```text
Der Loyalty-Core ist fachlich auf Aktiv/Inaktiv bzw. Live-only bereinigt. Shadow ist kein sichtbarer oder auswählbarer Betriebsmodus mehr.
```

### Bestätigt

```text
/api/loyalty/status meldet mode=live, enabled=true, shadowMode=false, pointsState=active.
Die alten Hauptstatusfelder streamElementsStillActive und importStatus sind aus dem normalen Status entfernt.
Legacy-Hinweise bleiben nur im Diagnosebereich diagnostics.legacyFallbacks.
Dashboard-Wording wurde auf Punkte-Core Aktiv/Inaktiv bereinigt.
```

### Nicht geändert

```text
Keine produktive SQLite ersetzt.
Keine Transaktionen gelöscht.
Keine DB-Shadow-Spalten gedroppt.
Keine Raffle-Logik geändert.
```

## 2026-06-16 – LC-CORE-LIVE-CLEANUP-2 Live-only geprüft

### Ergebnis

```text
Loyalty läuft jetzt fachlich live-only. Shadow-Migration ist abgeschlossen und Shadow ist leer.
```

### Bestätigt

```text
/api/loyalty/status:
  version = 0.1.24
  mode = live
  enabled = true
  shadowMode = false

Migrationstool-Dry-Run:
  candidates=0 totalShadow=0
  excluded=0 excludedShadow=0
```

### Referenzprüfungen

```text
Urlug:
  balanceShadow = 0
  balanceLive   = 1006852
  activeBalance = 1006852

Tronic6:
  balanceShadow = 0
  balanceLive   = 12536
  activeBalance = 12536
```

### Wichtig

```text
DB-Spalten fuer Shadow bleiben vorerst bestehen, werden aber fachlich nicht mehr genutzt.
API-Kompatibilitätsfelder bleiben vorerst vorhanden.
Späterer Cleanup soll alte Shadow-/Import-Begriffe in Status/Dashboard/Doku prüfen und bereinigen.
```

## 2026-06-16 – LC-CORE Shadow->Live Migration

### Ergebnis

```text
Normale User wurden mit ihren Shadow-Punkten nach Live migriert.
Test-/Bridge-/Diagnose-User wurden aus der produktiven Migration ausgeschlossen.
Ignored/System-Reste wurden nicht nach Live gebucht.
Rest-Shadow-Werte wurden danach gezielt genullt.
```

### Zahlen

```text
migrated = 468
amount = 69116
failed_ignored_by_api = 4
Rest-Clear = 40 User / 10064 Kekskrümel
Abschluss = 0 Shadow-User / 0 Shadow-Summe
```

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
Textvarianten-Tabelle zeigt nur den ausgewählten Bereich.
```
