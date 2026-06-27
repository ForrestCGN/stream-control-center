# CURRENT CHAT HANDOFF – EVS-8b EventBus / Heartbeat TODO Documentation

Stand: EVS-8b / EventBus- und Heartbeat-TODO für das Event-System

## Ziel

Die spätere Runtime muss ausdrücklich den vorhandenen Communication-/EventBus nutzen. Zusätzlich sollen Anmeldung, Heartbeat, Modulstatus und Diagnosepunkte für `stream_events` eingeplant werden.

## Wichtig

Dieser Step ist reine Dokumentation/TODO-Konsolidierung.

Keine Codeänderung, keine DB-Änderung, keine Runtime-Änderung.

## Festgelegt

- Kein eigener neuer Bus.
- Nutzung des vorhandenen `communication_bus` / `helper_communication`.
- `stream_events` soll sich später sauber am Bus anmelden.
- `stream_events` soll Heartbeats senden.
- Status-Publish für Modul, Config, Runtime, aktives Event und Fehlerzustände.
- Runtime-Events für Eventstart/-ende, Sound/Text-Runden, Treffer, Punkte und Ranking.

## Später einplanen

- Dashboard-/Diagnoseanzeige für letzten Heartbeat.
- Anzeige, ob Sound/Text/Chat-Auswertung bereit sind.
- Status des aktiven Events über den Bus verfügbar machen.
- Fehler über Bus/Diagnose sichtbar machen.

## StepDone

Optionaler Doku-StepDone:

```powershell
.\stepdone.cmd "EVS-8b EventBus Heartbeat TODO Docs"
```
