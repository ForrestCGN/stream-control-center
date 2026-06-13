# NEXT_STEPS – EVS-8

Stand: EVS-8 / Config-Dashboard Vorbereitung

## Nach Entpacken

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-8 Config Dashboard Prep"
```

Erst danach Dashboard testen.

## Dashboard-Test

- Tab Config öffnen.
- Allgemeine Defaults prüfen.
- Sound-Spiel Defaults ändern und speichern.
- Text-Spiel/Wortpunkte Defaults ändern und speichern.
- Seite neu laden und prüfen, ob Werte erhalten bleiben.
- Neues Event öffnen und prüfen, ob Default-Werte übernommen werden.

## Danach

- Config optisch/inhaltlich nach Test anpassen.
- Rechte/Freigaben für Config planen.
- Statistik pro Event im Statistik-Tab vorbereiten.
- Runtime für Chat-Auswertung planen.
