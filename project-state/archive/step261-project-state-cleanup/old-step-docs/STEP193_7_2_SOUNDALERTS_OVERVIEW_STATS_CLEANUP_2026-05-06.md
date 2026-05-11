# STEP193.7.2 - SoundAlerts Overview / Statistik Cleanup

Stand: 2026-05-06

## Ziel

SoundAlerts-Dashboard weiter entschlacken: Startseite und Statistik sollen nur relevante Informationen zeigen.

## Geaendert

- Test-Buttons `Test Fahrstuhl` und `Test Unbekannt` aus der Hero-Leiste entfernt.
- Tab-Reihenfolge angepasst: `Bot & Settings` steht jetzt hinten.
- KPI `Datei gefunden` in `Auto-zugeordnet` umbenannt, weil `file_matched` nur automatisch zugeordnete Dateien beschreibt.
- Uebersicht zeigt keine irrelevanten Miniwerte wie `Nicht eingerichtet` mehr.
- Statistik optisch ueberarbeitet:
  - Summary-Kacheln fuer `Abgespielt`, `Sound-Ausloesungen`, `User-Ausloesungen`, `Verschiedene Sounds`, `Verschiedene User`
  - Top-Sounds
  - Top-User
  - gefilterter Abspiel-Status ohne `Nicht eingerichtet` und `In Warteschlange`

## Nicht geaendert

- Keine Backend-Aenderung.
- Keine API-Aenderung.
- Keine DB-Aenderung.
- Keine SoundAlerts-Abspiellogik geaendert.
- Bestehende Test-Actions im JS bleiben intern vorhanden, werden nur nicht mehr prominent in der Hero-Leiste angezeigt.

## Tests

```text
node --check htdocs/dashboard/modules/soundalerts.js
```

## Hinweise

`Auto-zugeordnet` bedeutet: SoundAlerts-Bridge konnte fuer einen SoundAlert automatisch eine passende vorhandene Datei erkennen. Das ist nicht gleichbedeutend mit `Aktiv`; ein Eintrag kann automatisch zugeordnet und trotzdem bewusst inaktiv sein.
