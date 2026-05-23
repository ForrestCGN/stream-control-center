# STEP276I - Alert MediaId Doku-/Status-Sync

Datum: 2026-05-23
Projekt: `stream-control-center`
Bereich: Alert-System / Media-Registry / Dashboard

Dieser Schritt ist ein reiner Dokumentations- und Status-Sync. Es werden keine Backend- oder Dashboard-Code-Dateien geändert.

## Abgeschlossener technischer Stand

STEP276 hat die Alert-Medien schrittweise an die zentrale Media-Registry angebunden, ohne bestehende Legacy-Fallbacks zu entfernen.

### Backend / Datenbank

- `alert_rules.sound_media_id` vorbereitet und zuverlässig sichergestellt.
- `alert_rules.image_media_id` vorbereitet und zuverlässig sichergestellt.
- Rules-API gibt die neuen Felder aus.
- Rules-API reichert Media-Registry-Details an:
  - `sound_media_label`
  - `sound_media_duration_ms`
  - `sound_media_path`
  - `sound_media_url`
  - `sound_media_type`
  - analoge Bild-/Grafikdetails für `image_media_id`, soweit vorhanden.
- Alert-Playback bevorzugt `sound_media_id`.
- Legacy-Sound-Fallback über `sound_asset_id` / `sound_url` bleibt erhalten.
- Fehler aus STEP276C behoben: Main-Sound-Item wird wieder korrekt ins Sound-System-Bundle zurückgegeben.
- Alert-Hauptsound + TTS funktionieren zusammen wieder korrekt.

### Dashboard / Alerts

- Alert-Regel-Editor kann Sounds aus der Media-Registry auswählen.
- Alte Soundauswahl bleibt als „Alter Sound / Fallback“ erhalten.
- Media-Registry-Sound hat Vorrang, Legacy-Sound wird nur genutzt, wenn kein Media-Sound gesetzt ist.
- Alert-Regel-Editor zeigt Media-Registry-Soundlabel und echte Media-Dauer an.
- Beispiel aus Test: MediaId `1333` zeigt korrekt ca. `24.3s` statt falscher Legacy-Dauer `11.2s`.
- Design-Grafik über dem Alert kann aus der Media-Registry gewählt werden.
- Regel-Grafik/Bild kann über `image_media_id` aus der Media-Registry gewählt werden.
- Alte Bild-/Grafik-Auswahlen bleiben als Fallback erhalten.

### Overlay / Playback

- Sound-System akzeptiert `mediaId` / `media_id` direkt aus der Media-Registry.
- Alert-System sendet bei gesetzter `sound_media_id` das MediaId-basierte Main-Sound-Item.
- TTS bleibt im selben Sound-System-Bundle erhalten.
- Das Overlay nutzt weiterhin die vorhandenen URLs/Felder; neue Media-Registry-Daten werden im Alert-Payload bevorzugt gesetzt.

## Legacy bleibt absichtlich erhalten

Nicht entfernt:

- `sound_asset_id`
- `image_asset_id`
- `sound_url`
- `image_url`
- `alert_assets`
- Legacy-Uploadordner:
  - `htdocs/assets/sounds/alerts`
  - `htdocs/assets/images/alerts`

Grund: Bestehende Alerts dürfen nicht kaputtgehen. Media-Registry hat Vorrang, Legacy bleibt Sicherheitsnetz.

## Bekannte offene UI-Themen

Der aktuelle Dashboard-Bereich ist funktional, aber optisch noch nicht final. Für ein späteres Dashboard-Redesign vormerken:

- Medienbereiche nicht mehr in enge Kacheln quetschen.
- Klare Struktur nach Tabs/Akkordeons:
  - Sound
  - Regel-Grafik
  - Design-Grafik
  - Legacy/Fallbacks
- Fallbacks optisch weniger prominent, aber erreichbar halten.
- Keine unnötigen Erklärtexte in kleinen Kacheln.
- Einheitliche Kacheloptik für Dropdowns/Regler.

## Wichtige Testergebnisse

- Backend `/api/alerts/status` lief mit `ok: true`, `step: 276`, `schemaVersion: 6`.
- `/api/alerts/rules` gibt `sound_media_id` und `image_media_id` aus.
- Media-Registry-Sound wurde abgespielt.
- Legacy-Sound/Fallback wurde weiterhin abgespielt.
- TTS läuft nach dem Alert-Sound im Bundle.
- MediaId `1333` wurde korrekt als Media-Registry-Sound erkannt und angezeigt.

## Keine Funktionalität entfernen

Diese Regel bleibt verbindlich:

> Keine Funktionalität entfernen.

Alle STEP276-Änderungen wurden als additive Migrationen/Fallback-Erweiterungen umgesetzt.
