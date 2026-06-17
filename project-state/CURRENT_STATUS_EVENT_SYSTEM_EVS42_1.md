# CURRENT_STATUS_EVENT_SYSTEM_EVS42_1

Stand: 2026-06-17

## Kurzstatus

Das Event-System hat einen stabileren Runtime-/Recovery-Stand erreicht. Sound-Schnipsel laufen über das Sound-System, Antwortzeiten kommen aus den Event-Einstellungen, Wartezeiten können übersprungen werden, Recovery nach Node-/Rechner-Neustart requeued laufende Runden und Stream-Offline-Pause funktioniert im Grundfall.

Gewinner-/Finale-Grundlage ist vorbereitet. Finale darf nur bei `finished` starten. Das Gewinner-Finale-Overlay existiert als Demo/Show-Overlay in EVS42.1.

## Bestätigt

```text
EVS36.2: Antwortfenster nutzt Event-Einstellung, nicht Schnipselwert.
EVS37.1: stream_events lädt wieder korrekt nach Runtime-State Load-Fix.
EVS37: Node-Recovery requeued unterbrochene Runde korrekt.
EVS38: Stream-Offline-Pause + manuelles Resume im waiting-Fall funktioniert.
EVS39.1: Nächster Schnipsel Auto-Reload/Countdown im Dashboard.
EVS41: Finale blockt korrekt, wenn Event nicht finished ist.
EVS42.1: Extended Gewinner-Overlay als Demo vorhanden.
```

## Noch nicht final bestätigt

```text
- Stream-Offline-Pause während laufendem Sound/Antwortfenster.
- Winner-Finale mit echten Eventdaten und Bus-Event.
- Text-/Satz-Teil im selben Umfang wie Sound-Runtime.
- !event Commands produktiv über Command-/ChatOutput-System.
```

## Aktueller Verdacht

Forrest hat einen möglichen Fehler im System erwähnt. Dieser ist noch nicht konkret analysiert. Vor neuen Feature-Steps zuerst Fehlersituation prüfen.
