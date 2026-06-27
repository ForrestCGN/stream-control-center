# CAN-42.14c - Dashboard Diagnostics Label-Feinschliff

## Ziel

Der generische Standard-Diagnoseblock soll vorhandene Daten weiter lesbarer anzeigen, ohne Backend- oder Statusdaten zu verändern.

## Geänderte Datei

```text
htdocs/dashboard/modules/diagnostics_generic_details.js
```

## Änderungen

- Modulversion des Frontend-Fixes auf `0.1.3-can42-14c` erhöht.
- Datenbanklabels geglättet:
  - `DB OK` -> `Datenbank OK`
  - `DB Adapter` -> `Datenbank-Typ`
  - `DB Pfad` -> `Datenbank-Pfad`
  - `DB Schema` -> `Datenbank-Schema`
  - `DB Erwartet` -> `Erwartetes Schema`
  - `DB Fehler` -> `Datenbank-Fehler`
- `Phase` wird als `Statusphase` angezeigt.
- Abschnitt `Queue` wird als `Warteschlange` angezeigt.
- Abschnitt `Runtime` wird als `Laufzeit` angezeigt.

## Nicht geändert

```text
backend/*
Statusrouten
DB
produktive Aktionen
Hug-/Command-/VIP-/Rotator-Logik
htdocs/dashboard/index.html
```

Keine Funktionalität entfernt.

## Test

```powershell
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
```
