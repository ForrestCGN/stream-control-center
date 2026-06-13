# CURRENT_STATUS – EVS-8b

Stand: EVS-8b / EventBus- und Heartbeat-TODO dokumentiert

## Aktueller Stand

Das Event-System-Dashboard hat die Haupttabs:

- Übersicht
- Events
- Texte
- Config
- Statistik
- Overlay

Übersicht zeigt laufende Events. Events zeigt die konfigurierten Events mit Status. Bearbeitung läuft über ein separates Editor-Fenster.

Der Config-Tab ist als erster echter Einstellbereich vorbereitet. Globale Defaults können geladen und gespeichert werden.

## Neu festgehalten in EVS-8b

Für spätere Runtime-Schritte ist verbindlich dokumentiert:

- vorhandenen Communication-/EventBus nutzen
- keinen neuen parallelen Bus bauen
- `stream_events` später sauber am Bus anmelden
- Heartbeat für `stream_events` einplanen
- Modulstatus für Config, Runtime, aktives Event und Fehler publishen
- Runtime-Events für Eventstart/-ende, Sound/Text, Punkte und Ranking senden

## Unverändert

Keine produktive Runtime für Chat, Worterkennung, Sound-Playback oder Overlay.

EVS-8b enthält keine Code- oder DB-Änderung.

## Offen

- Rechte/Freigaben für Config.
- Event-Statistik pro Event.
- Sound-/Text-Runtime.
- Chat-Auswertung.
- EventBus-Anmeldung/Heartbeat technisch umsetzen.
- Overlay.
