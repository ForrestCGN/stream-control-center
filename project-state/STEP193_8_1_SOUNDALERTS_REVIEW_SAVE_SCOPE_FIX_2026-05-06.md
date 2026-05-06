# STEP193.8.1 - SoundAlerts Review Save Scope Fix

Stand: 2026-05-06

## Ziel

Review-/Zur-Pruefung-Eintraege duerfen nicht alle auf einmal freigegeben werden, wenn nur ein einzelner Eintrag bearbeitet und gespeichert wird.

## Aenderungen

- `Speichern / Freigeben` im Eintrag finalisiert nur noch den aktuell bearbeiteten Eintrag.
- Globales `Config speichern` speichert Konfiguration/Settings, gibt aber keine anderen `Zur Pruefung`-Eintraege frei.
- Upload setzt den Eintrag auf `review_required` und gibt ihn nicht automatisch frei.
- Bestehende Statuswerte anderer Eintraege bleiben beim Speichern erhalten.

## Nicht geaendert

- Keine Backend-/API-/DB-Aenderung.
- Keine Entfernung von Ignorieren/Loeschen/Replay.
- Keine neue DB-Migration.

## Test

```text
node --check htdocs/dashboard/modules/soundalerts.js
```

## Erwartetes Verhalten

- Vier Eintraege in `Zur Pruefung`.
- Einen Eintrag bearbeiten und `Speichern / Freigeben`.
- Danach ist nur dieser eine Eintrag aktiv/inaktiv.
- Die anderen drei bleiben weiter `Zur Pruefung`.
