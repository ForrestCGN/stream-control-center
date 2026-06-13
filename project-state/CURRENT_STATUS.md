# CURRENT_STATUS – EVS-8

Stand: EVS-8 / Config-Dashboard Vorbereitung

## Aktueller Stand

Das Event-System-Dashboard hat jetzt die Haupttabs:

- Übersicht
- Events
- Texte
- Config
- Statistik
- Overlay

Übersicht zeigt laufende Events. Events zeigt die konfigurierten Events mit Status. Bearbeitung läuft über ein separates Editor-Fenster.

Der Config-Tab ist jetzt als erster echter Einstellbereich vorbereitet. Globale Defaults können geladen und gespeichert werden.

## Config umfasst

- Allgemeine Event-Defaults
- Sound-Spiel Defaults
- Text-Spiel Defaults
- Wortpunkte Defaults
- Overlay Defaults

## Unverändert

Keine produktive Runtime für Chat, Worterkennung, Sound-Playback oder Overlay.

## Offen

- Rechte/Freigaben für Config.
- Event-Statistik pro Event.
- Sound-/Text-Runtime.
- Chat-Auswertung.
- Overlay.


## EVS-9 – EventBus / Heartbeat Integration

Aktueller Stand: `stream_events` hat nun einen eigenen sichtbaren EventBus-/Heartbeat-Step. Das Modul nutzt den vorhandenen `communication_bus`, registriert sich dort als Backend-Modul, sendet Heartbeats und publisht Modulstatus. Zusaetzlich gibt es `GET /api/stream-events/bus-status` fuer Diagnose/Monitoring.

Nicht enthalten: Chat-Runtime, Sound-Playback, Worterkennung, automatische Punktevergabe, Overlay.
