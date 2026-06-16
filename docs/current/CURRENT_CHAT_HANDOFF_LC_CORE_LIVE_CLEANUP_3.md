# CURRENT_CHAT_HANDOFF – LC CORE LIVE CLEANUP 3

Stand: 2026-06-16

## Aktueller bestätigter Stand

```text
LC-CORE-LIVE-CLEANUP-3 – Status und Dashboard auf Aktiv/Inaktiv bereinigt und geprüft
```

## Wichtigste Bestätigung

```text
/api/loyalty/status:
mode = live
enabled = true
shadowMode = false
pointsState = active
version = 0.1.24
```

Die alten Hauptstatusfelder `streamElementsStillActive` und `importStatus` sind aus dem normalen Status entfernt. Legacy-Informationen stehen nur noch im Diagnosebereich `diagnostics.legacyFallbacks`.

## Shadow-Migration

```text
Shadow ist leer.
Normale User wurden nach Live migriert.
Test-/Bridge-/System-Reste wurden genullt.
Migrationstool-Dry-Run: candidates=0 totalShadow=0, excluded=0 excludedShadow=0.
```

Referenzwerte:

```text
Urlug   balanceLive=1006852 balanceShadow=0 activeBalance=1006852
Tronic6 balanceLive=12536   balanceShadow=0 activeBalance=12536
```

## Fachliche Betriebslogik

```text
Aktiv   = Punkte laufen live
Inaktiv = Punkte werden nicht verarbeitet
Shadow  = kein sichtbarer/produktiver Betriebsmodus mehr
```

## Geänderte Dateien im Cleanup-3

```text
backend/modules/loyalty.js
htdocs/dashboard/modules/loyalty.js
```

## Dokumentationsdateien dieses Updates

```text
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_LC_CORE_LIVE_CLEANUP_3.md
docs/modules/loyalty.md
project-state/CURRENT_STATUS_LC_CORE_LIVE_CLEANUP_3.md
```

## Weiter offen

```text
Raffle-Teilnahmekosten live testen:
- kostenloser Join
- kostenpflichtiger Join mit genug Punkten
- zu wenig Punkte
- Doppeljoin ohne zweite Abbuchung
- Cancel/Refund
- normaler Abschluss mit Auszahlung
```

## Nicht tun

```text
Keine produktive SQLite ersetzen.
Keine Transaktionen löschen.
Keine Shadow-DB-Spalten ohne vollständige Referenzprüfung droppen.
Keine Alerts produktiv umschalten.
Keine neue Raffle-Parallelstruktur bauen.
```
