# Modul: loyalty

Stand: 2026-06-11  
Aktueller bestätigter Stand: STEP213 / LWG-5.5

## Zweck

`loyalty` verwaltet das Kekskrümel-/Loyalty-Konto, verfügbare Punkte, Reservierungen, Transaktionen, Ranking und die vorbereiteten Points-Commands.

## Aktueller Runtime-Stand

```text
backend/modules/loyalty.js
Version: 0.1.13
Step: STEP210
```

STEP211 bis STEP213 enthalten keine Runtime-JS-Änderungen, sondern Doku/Test-/Freigabe-Scripte.

## Wichtige Fachlogik

```text
verfügbare Kekskrümel = active balance - offene Reservierungen
```

Ranking für `!punkte / !points` basiert auf den verfügbaren Kekskrümeln.

## Bestätigte Tests

```text
STEP212b / LWG-5.4b – Points Runtime kontrolliert bestätigt
```

Bestätigt im Live-System:

```text
available=3400
rank=2
total=418
!punkte self ok
!points Alias ok
!punkte @user blockt Nicht-Mods korrekt
!punkte wurde nach temporärem Test wieder deaktiviert
```

## Freigabestand STEP213

STEP213 liefert Scripte für:

```text
Activate_STEP213_LWG5_5_points_command_ForrestCGN.ps1
Rollback_STEP213_LWG5_5_points_command_ForrestCGN.ps1
Test_STEP213_LWG5_5_points_command_live_ForrestCGN.ps1
```

Aktiviert werden darf nur:

```text
!punkte
!points
```

## Commands

```text
!punkte / !points
- zeigt nur verfügbare Kekskrümel
- zeigt Rang und Gesamtzahl gewerteter User
- normale User: nur eigene Punkte
- Zieluser-Abfrage: erst ab Mod/Streamer
```

Noch nicht freigegeben:

```text
!givepoints
!setpoint
```

## Textsystem

Alle Chattexte müssen über DB/Helper laufen:

```text
module_texts
module_text_variants
helper_texts
```

Stil:

```text
CGN / Altersheim / Heimleitung / Rentner
```

Keine finalen Chattexte hart codieren.

## Datenbank / Migration

```text
SQLite aktuell aktiv
MySQL/MariaDB portabel planen
keine DB ersetzen
keine Transaktionen löschen
nur sichere Migrationen / CREATE TABLE IF NOT EXISTS / Safety-Net
```
