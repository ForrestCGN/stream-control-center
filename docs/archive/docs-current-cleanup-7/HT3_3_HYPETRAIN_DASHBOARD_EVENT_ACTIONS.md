# HT3.3 – HypeTrain Dashboard Event-Actions

Dashboard-Erweiterung für HypeTrain Event-Actions.

## Zweck

- Start / Stufenaufstieg / Ende / Rekord im Dashboard konfigurieren.
- Sound-Auswahl über vorhandenes MediaField/MediaPicker vorbereiten.
- Sound-Ausführung bleibt beim bestehenden `sound_system`.
- Overlay-Events bleiben technische Vorbereitung, kein fertiges Overlay-Design.

## Dateien

- `htdocs/dashboard/index.html` lädt die Erweiterung.
- `htdocs/dashboard/modules/hypetrain_event_actions.js` ergänzt den bestehenden HypeTrain-Bereich.
- `htdocs/dashboard/modules/hypetrain_event_actions.css` ergänzt Styles.

## Sicherheit

Alle neuen Event-Aktionen bleiben standardmäßig deaktiviert. Speichern ändert nur Config; es löst keinen produktiven HypeTrain aus.
