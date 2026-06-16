# Project State – LC_CORE_LIVE_CLEANUP_2

Stand: 2026-06-16

## Kurzstatus

Loyalty-Core ist live-only geprüft. Shadow-Migration ist vollständig abgeschlossen und Shadow ist leer.

## Bestätigte Live-Werte

```text
/api/loyalty/status:
  version = 0.1.24
  mode = live
  enabled = true
  shadowMode = false

Urlug:
  balanceShadow = 0
  balanceLive = 1006852
  activeBalance = 1006852

Tronic6:
  balanceShadow = 0
  balanceLive = 12536
  activeBalance = 12536

Migrationstool:
  candidates=0 totalShadow=0
  excluded=0 excludedShadow=0
```

## Migrationsergebnis

```text
Normale User wurden nach Live migriert.
Test-/Bridge-/Diagnose-User wurden nicht nach Live übernommen.
Ignored/System-Reste wurden nicht nach Live gebucht.
Rest-Shadow-Werte wurden gezielt genullt.
```

## Nächster Arbeitsblock

```text
Raffle-Teilnahmekosten live testen.
```

## Danach planen

```text
LC-CORE-LIVE-CLEANUP-3:
- Shadow-/Import-Begriffe aus Status/Dashboard/Doku bereinigen
- streamElementsStillActive/importStatus prüfen
- shadowMode nur noch kompatibel oder entfernen, falls sicher
- DB-Spalten balance_shadow/total_earned_shadow/total_spent_shadow erst nach Referenzprüfung behandeln
```
