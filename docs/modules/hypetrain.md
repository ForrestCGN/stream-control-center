# HypeTrain-Modul

Stand: HT4.3 / 2026-06-22
Backend-Version: `0.2.3`
Backend-Build: `STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX`

## Zweck

Das HypeTrain-Modul verarbeitet Twitch-HypeTrain-Events, spielt konfigurierte Event-Sounds über das zentrale `sound_system` ab und schreibt HypeTrain-Ende weiterhin ins Tagebuch.

## Aktueller bestätigter Stand

- HypeTrain-Ende schreibt über das Tagebuch-System.
- Discord sichtbarer Name kommt vom Tagebuch-Webhook (`CGN Posty`).
- Direkt-Discord bleibt deaktiviert/skipped, sofern nicht bewusst konfiguriert.
- Event-Actions für Start, Stufenaufstieg, Ende und Rekord sind backendseitig vorbereitet.
- Sound-Aufrufe laufen ausschließlich über `sound_system` (`/api/sound/play`).
- HypeTrain sendet Overlay-Ereignisse als Bus-Events.
- Die finale HypeTrain-Anzeige wird nicht als eigenes paralleles HypeTrain-Overlay-System gebaut.
- HypeTrain-Anzeigen laufen künftig über das zentrale Event-Overlay.

## Relevante Dateien

Backend:

- `backend/modules/hypetrain.js`
- `backend/modules/sound_system.js`
- `backend/modules/communication_bus.js`
- `backend/modules/helpers/helper_communication.js`

Dashboard:

- `htdocs/dashboard/modules/hypetrain.js`
- `htdocs/dashboard/modules/hypetrain.css`

Overlay:

- `htdocs/overlays/central_event_overlay.html`
- `htdocs/overlays/shared/overlay_bus_client.js`

## Dashboard

Das HypeTrain-Dashboard nutzt weiterhin nur das normale HypeTrain-Modul:

- `htdocs/dashboard/modules/hypetrain.js`
- `htdocs/dashboard/modules/hypetrain.css`

Es gibt keine separaten `hypetrain_event_actions.js/css` Dateien mehr.

Tabs:

- Übersicht
- Config
- Event-Actions
- Texte
- Statistik
- Tests

Tests/Prüfungen liegen getrennt im Tests-Tab und nicht im Event-Actions-Tab.

## Aktuelle Event-Actions

- Start-Sound: aktiv, `mediaId 1618`, `hasMedia true`
- Rekord-Sound: aktiv, `mediaId 1602`, `hasMedia true`
- Stufenaufstieg: geplant/offen, noch ohne Sound
- Ende: geplant/offen, noch ohne Sound

Tagebuch-Endeintrag bleibt aktiv und unabhängig von den Event-Sounds.

## Overlay-Integration ab HT4

Das zentrale Event-Overlay wurde vorbereitet:

- Datei: `htdocs/overlays/central_event_overlay.html`
- Overlay-Version: `0.1.3`
- Stand: `HT4.3`

Bestätigt getestete HypeTrain-Overlay-Channels:

- `hypetrain.overlay.start`
- `hypetrain.overlay.level_up`
- `hypetrain.overlay.end`
- `hypetrain.overlay.record`

Das Overlay ist als Bus-Client registriert:

- Client-ID: `overlay:central_event_overlay`
- Modul: `central_event_overlay`

Bestätigt:

- verbunden mit Communication Bus
- Heartbeat aktiv
- Start sichtbar
- Level-Up sichtbar
- Ende sichtbar
- Rekord sichtbar

## Architekturentscheidung

Keine eigene parallele HypeTrain-Overlay-Schiene bauen.

Richtig:

1. HypeTrain verarbeitet Twitch-/HypeTrain-Logik.
2. HypeTrain sendet Events über den Communication Bus.
3. `sound_system` spielt Sounds.
4. `central_event_overlay` zeigt kurze visuelle Hinweise.

Falsch:

- HypeTrain-Sounds direkt im Overlay starten
- eigenes HypeTrain-Overlay-System neben dem zentralen Overlay aufbauen
- eigene Upload-/Media-Auswahl im HypeTrain-Modul bauen

## Kurzprüfung Central Event Overlay

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$s.status.clients |
  Where-Object id -eq "overlay:central_event_overlay" |
  Select-Object id,connected,status,lastSeenAt,capabilities |
  Format-List
```

## Offene Punkte

- Level-Up-Sound auswählen/aktivieren, sobald ein Medium vorhanden ist
- Ende-Sound auswählen/aktivieren, sobald ein Medium vorhanden ist
- echte HypeTrain-Live-Payloads während eines echten HypeTrains prüfen
- Central Event Overlay später mit finaler Template-/Mode-Struktur ausbauen
- spätere OBS-/Dashboard-Verwaltung des zentralen Overlays separat planen
