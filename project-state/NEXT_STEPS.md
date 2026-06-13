# NEXT_STEPS – EVS-8b

Stand: EVS-8b / EventBus- und Heartbeat-TODO dokumentiert

## Nach Entpacken

Dieser Step enthält nur Dokumentation/TODO. Optional:

```powershell
.\stepdone.cmd "EVS-8b EventBus Heartbeat TODO Docs"
```

## Danach

- EVS-8 Dashboard/Config weiter testen und optisch prüfen.
- Config optisch/inhaltlich nach Test anpassen.
- Rechte/Freigaben für Config planen.
- Statistik pro Event im Statistik-Tab vorbereiten.
- Runtime für Chat-Auswertung planen.
- EventBus-Anmeldung/Heartbeat bei der Runtime-Umsetzung berücksichtigen.

## EventBus/Heartbeat später umsetzen

- `stream_events` am vorhandenen Bus anmelden.
- Heartbeat regelmäßig senden.
- Modulstatus publishen.
- Aktives Event und Runtime-Status über Diagnose/Bus sichtbar machen.
- Bus-Events für Eventstart, Eventende, Sound/Text-Treffer, Punkte und Ranking senden.
