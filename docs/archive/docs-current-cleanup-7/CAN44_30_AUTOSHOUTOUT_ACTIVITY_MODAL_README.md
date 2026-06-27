# CAN44.30 AutoShoutout Activity Modal

## Inhalt

Dieser Stand verbessert die Dashboard-Karte „Letzte Auto-SO-Aktivität“.

## Geänderte Dateien

- `htdocs/dashboard/modules/auto_shoutout.js`
- `htdocs/dashboard/modules/auto_shoutout.css`

## Änderung

- Die Aktivitätsliste zeigt jetzt kompakt nur noch:
  - Uhrzeit
  - Streamer
  - Kurzstatus
  - Info-Button
- Der Info-Button öffnet ein Modal mit Detaildaten:
  - Streamer
  - Auslöser
  - Status
  - Kurzstatus
  - Grund
  - Zeit
  - DisplayQueue-ID
  - Quelle
  - Chat-Nachricht
  - Stream-Day
  - aufklappbare Rohdaten
- Bestehende Streamer-Verwaltung, Einstellungen, Test-Button, Auto-Refresh und Queue-/Statusbereiche bleiben erhalten.

## Test

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modules\auto_shoutout.js
```

Danach Backend/Frontend aktualisieren und im Dashboard im AutoShoutout-Tab die letzte Aktivität prüfen.

## StepDone

```cmd
.\stepdone.cmd "CAN44.30 AutoShoutout Activity Info Modal"
```
