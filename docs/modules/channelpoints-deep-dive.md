# Channelpoints / Kanalpunkte – v0.7.0 Safe Modal Editor

Stand: 2026-05-26

## Ziel

Das Kanalpunkte-Dashboard folgt ab v0.7.0 dem Bedienmuster des Commands-Dashboards:

- Rewards werden nach Kategorien gruppiert angezeigt.
- Rewards können gesucht, direkt ausgewählt, erstellt, bearbeitet, kopiert, deaktiviert/aktiviert und lokal gelöscht werden.
- Erstellen/Bearbeiten passiert in einem Modal mit eindeutigem Modus.
- Gespeicherte Werte sind beim Bearbeiten maßgeblich.
- Technische Felder liegen unter „Erweitert / technische Details“.

## Versionen

- Backend: `moduleVersion = 0.7.0`
- Backend: `moduleBuild = safe-modal-editor`
- Dashboard: `UI_VERSION = 0.7.0`
- Dashboard: `UI_BUILD = safe-modal-editor`

## Normale Aktionsauswahl

Neue Rewards starten mit benutzerfreundlichen Hauptaktionen:

1. Sound abspielen
2. Video anzeigen
3. Text anzeigen
4. Nur verwalten
5. Benutzerdefinierte Aktion

Die passende Maske wird direkt unter der Auswahl angezeigt.

## Medienausführung

Sound/Video nutzen weiterhin die bestehende Brücke:

`mediaId -> /api/sound/play`

Die Medien selbst kommen aus der vorhandenen Medienverwaltung/MediaField. Es wird keine zweite Upload-Logik im Kanalpunkte-Modul eingeführt.

## Löschen

Neu:

- `DELETE /api/channelpoints/rewards/:idOrKey`
- `POST /api/channelpoints/rewards/:idOrKey/delete`

Das Löschen ist lokal. Twitch wird dadurch nicht verändert.

## Sicherheit

- Produktive SQLite-Datenbank wird nicht ersetzt.
- Keine destruktive Migration.
- Twitch-Schreibzugriffe bleiben deaktiviert.
- Deaktivieren/Löschen ist weiterhin lokal.
