# CURRENT STATUS

Stand: EVS-7 / Text-Config Dashboard Prep  
Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center

## Aktueller Stand

EVS-7 baut auf EVS-6 auf.

Vorhanden:

- Backend Foundation für Stream Events.
- Dashboard-Skeleton für Events.
- MediaPicker-Integration für Sound-Schnipsel und optionale Videos.
- Multi-Satz-Textspiel-Konfiguration.
- Teiltreffer-/Wortpunkte-Konfiguration als Event-Config.
- Text-Config-/Multi-Texte-Panel im Dashboard vorbereitet.

## EVS-7 neu

- `stream_events` hat Textkeys für Sound-/Text-Spiel vorbereitet.
- `/api/stream-events/texts` kann Textvarianten lesen und per POST speichern/löschen.
- Dashboard zeigt Textkategorien, Textkeys und Varianten an.
- Varianten können bearbeitet, aktiviert/deaktiviert, gewichtet, hinzugefügt und gelöscht werden.

## Weiterhin offen

- Twitch-Chat-Auswertung.
- Text-Spiel-Runtime.
- Worttreffer-Tracking pro Event/Satz/User/Wort.
- Punktevergabe für Worttreffer.
- Sound-Rundensteuerung.
- Overlay.
- Statistikansicht.
- Allgemeines Config-Dashboard für Event-Regeln.
