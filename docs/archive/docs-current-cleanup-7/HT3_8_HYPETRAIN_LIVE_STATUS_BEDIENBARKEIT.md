# HT3.8 – HypeTrain Live-Status / Bedienbarkeit

## Ziel

HT3.8 ergänzt im HypeTrain-Dashboard eine klare Live-Übersicht, welche Event-Actions beim nächsten echten HypeTrain aktiv wären.

## Geändert

- `htdocs/dashboard/modules/hypetrain.js`
  - Übersicht zeigt jetzt den Block „Beim nächsten echten HypeTrain aktiv“.
  - Start, Stufenaufstieg, Ende und Rekord werden als kompakte Status-Kacheln angezeigt.
  - Statuswerte: Sound bereit, Sound aktiv aber Medium fehlt, Overlay-Bus aktiv oder geplant/offen.
  - Event-Actions-Tab bleibt normale Konfiguration.
  - Tests/Prüfungen bleiben getrennt im Tests-Tab.

- `htdocs/dashboard/modules/hypetrain.css`
  - Styles für die neue Live-Status-Kompaktanzeige ergänzt.

## Nicht geändert

- Kein Backend-Umbau.
- Keine Datenbankänderung.
- Kein Sound-System-Umbau.
- Keine extra `hypetrain_event_actions` Dateien.
- Keine neuen Sounds oder Medien.

## Bestätigter Live-Zustand vor HT3.8

- Start-Sound aktiv: `mediaId 1618`, `enabled true`, `hasMedia true`.
- Rekord-Sound aktiv: `mediaId 1602`, `enabled true`, `hasMedia true`.
- Stufenaufstieg: geplant/offen, kein Sound gesetzt.
- Ende: geplant/offen, kein Sound gesetzt.

## Architektur

HypeTrain bleibt Fachmodul. Sounds laufen über `sound_system`. Visuelle Anzeigen werden später als Template/Modus im zentralen Stream-/Event-Overlay umgesetzt und über Bus-Events angesteuert.
