# TODO – EVS-8b

## Erledigt bis EVS-8

- Backend Foundation.
- Dashboard Skeleton.
- MediaPicker Vorbereitung.
- Sound-/Text-Konfiguration im Event-Editor.
- Multi-Satz-Text-Spiel vorbereitet.
- Text-Config / Multi-Texte vorbereitet.
- Dashboard-Flow korrigiert:
  - Übersicht = laufende Events.
  - Events = konfigurierte Events mit Status.
  - Bearbeitung = separates Modal.
- Config-Tab mit globalen Defaults vorbereitet.

## EVS-8b festgehalten

- EventBus-Anmeldung für `stream_events` später einplanen.
- Heartbeat für `stream_events` später einplanen.
- Vorhandenen `communication_bus` / `helper_communication` nutzen.
- Keinen neuen parallelen Bus bauen.
- Modulstatus für Config, Runtime, aktives Event und Fehlerzustände publishen.
- Runtime-Events für Eventstart/-ende, Sound/Text, Punkte und Ranking über Bus senden.

## Offen: Config

- Rechte/Freigaben für Config.
- Weitere Streamer-/Mod-freundliche Labels.
- Prüfen, welche Defaults automatisch in neue Events übernommen werden sollen.
- Config ggf. in Kategorien/Tabs weiter verfeinern.

## Offen: Runtime

- Sound-Rotation.
- Text-Rotation.
- Chat-Auswertung.
- Teiltreffer/Wortpunkte.
- Punktevergabe.
- Eventabschluss / Top 3.
- EventBus-Anmeldung und Heartbeat technisch umsetzen.

## Offen: Statistik / Overlay

- Statistik pro Event.
- Sound-Statistik.
- Text-Statistik.
- Overlay-Anzeige.
