# Central Event Overlay

Stand: HT4.3 / Version 0.1.3
Datum: 2026-06-22

## Zweck

Das Central Event Overlay ist die neue zentrale Overlay-Basis für kurze Stream-/Event-Anzeigen.
Es ist bewusst kein eigenes HypeTrain-Spezialoverlay, sondern eine zentrale Grundlage für mehrere Event-Typen.

Aktuell genutzt/getestet für HypeTrain-Anzeigen:

- Start
- Level-Up
- Ende
- Rekord
- generische Meldungen

Später kann dieselbe Overlay-Basis auch für weitere kurze Anzeigen genutzt werden, z. B. Shot-Alarm, Loyalty-Hinweise oder Event-Hinweise.

## Datei

- `htdocs/overlays/central_event_overlay.html`

## Architektur

Das Overlay nutzt den vorhandenen gemeinsamen Overlay-Bus-Client:

- `htdocs/overlays/shared/overlay_bus_client.js`

Es meldet sich am Communication Bus als Overlay-Client an und sendet Heartbeats.

Client-ID:

- `overlay:central_event_overlay`

Modul:

- `central_event_overlay`

Wichtige Capabilities:

- `overlay.heartbeat`
- `central_event_overlay`
- `hypetrain.display`
- `generic.message`
- `hypetrain.overlay.start`
- `hypetrain.overlay.level_up`
- `hypetrain.overlay.levelup`
- `hypetrain.overlay.end`
- `hypetrain.overlay.record`

## Unterstützte Events

Direkte technische Event-Typen:

- `hypetrain.start`
- `hypetrain.level_up`
- `hypetrain.end`
- `hypetrain.record`
- `generic.message`

HypeTrain-Overlay-Channels:

- `hypetrain.overlay.start`
- `hypetrain.overlay.level_up`
- `hypetrain.overlay.levelup`
- `hypetrain.overlay.end`
- `hypetrain.overlay.record`

Diese HypeTrain-Channels werden intern auf die technischen Anzeige-Typen gemappt.

## Aktueller Funktionsstand

### HT4.0

- zentrale Overlay-Datei angelegt
- Bus-Client angebunden
- Heartbeat/Registrierung geprüft
- generische technische Platzhalteranzeige eingebaut
- Debug-Modus per `?debug=1`

### HT4.1

- echte HypeTrain-Overlay-Channels ergänzt
- Start, Level-Up, Ende und Rekord als Channels vorbereitet
- Anzeige der HypeTrain-Testevents bestätigt

### HT4.2

- Payload-Darstellung robuster gemacht
- Felder wie Level, Total/Punkte, Ziel/Goal, Rekordtyp und Supporter werden angezeigt, wenn sie im Event vorhanden sind
- Fallbacks bleiben aktiv, wenn Felder fehlen

### HT4.3

- erste CGN-Basisoptik ergänzt
- transparente Overlay-Fläche
- Neon-/Glass-Card oben mittig
- unterschiedliche Darstellungsvarianten für Start, Level-Up, Ende, Rekord und Generic
- Payload-Anzeige aus HT4.2 bleibt erhalten
- Debug-Anzeige bleibt nur mit `?debug=1`

## Getestet

Bestätigt im Live-System:

- `overlay:central_event_overlay` ist mit dem Communication Bus verbunden
- Status `connected: True`
- Status `online`
- Heartbeat aktiv
- `hypetrain.overlay.start` sichtbar angezeigt
- `hypetrain.overlay.level_up` sichtbar angezeigt
- `hypetrain.overlay.end` sichtbar angezeigt
- `hypetrain.overlay.record` sichtbar angezeigt

## Overlay-URL

Debug:

```text
http://127.0.0.1:8080/overlays/central_event_overlay.html?debug=1
```

Normal:

```text
http://127.0.0.1:8080/overlays/central_event_overlay.html
```

## Kurzprüfung

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$s.status.clients |
  Where-Object id -eq "overlay:central_event_overlay" |
  Select-Object id,connected,status,lastSeenAt,capabilities |
  Format-List
```

## Schutzregeln

- Kein separates paralleles HypeTrain-Overlay-System bauen.
- HypeTrain soll Events über den Communication Bus senden.
- Das zentrale Overlay zeigt diese Events über Templates/Modi an.
- Keine Sound-Logik im Overlay starten.
- Sound läuft weiter über `sound_system`.
- Keine OBS-Quellen automatisch ändern.
- Keine bestehenden Overlays löschen.

## Offene Punkte

- echte HypeTrain-Live-Payloads während eines echten HypeTrains prüfen
- finale Template-/Mode-Struktur für mehrere Eventtypen planen
- spätere Dashboard-/OBS-Verwaltung nur in einem eigenen geplanten Schritt
- weitere Eventtypen erst nach Prüfung ihrer echten Bus-Events anbinden
