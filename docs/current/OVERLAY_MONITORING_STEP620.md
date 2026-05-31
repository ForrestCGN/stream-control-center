# Overlay Monitoring – STEP620

Stand: STEP620 ergänzt die read-only OBS-Sicht im bestehenden Overlay-Monitor.

## Aktuelle Ebenen

### Bus-Ebene

Zeigt Clients, die sich am Communication-Bus melden.

Beispiele:

- `alert_overlay_v2_shadow`
- `sound_system_overlay_bus_consumer`
- `vip_sound_overlay_v2`

Wichtig: Bus online bedeutet aktuell nur, dass ein Client am WebSocket/Bus lebt. Es ist noch keine Bestätigung, dass die Quelle in OBS existiert oder sichtbar ist.

### OBS-Ebene

Zeigt read-only:

- OBS verbunden/erkannt/offline
- Program Scene
- Preview Scene
- Browserquellen aus `/api/obs/browser-sources`

## Warum das wichtig ist

Für wartende Overlays wie Alert, Sound, VIP oder Deathcounter sieht man im Streambild oft nichts. Die Kontrolle muss deshalb unterscheiden:

- OBS-Quelle existiert
- Quelle ist eingebunden/sichtbar
- Bus-Client meldet sich
- echter Heartbeat läuft
- Modul wartet korrekt auf Events

## Noch offen

- Hello und echter Heartbeat im Bus sauber trennen
- Meta/Herkunft aus `bus_hello` und `bus_heartbeat` vollständig übernehmen
- DB-Mapping zwischen OBS-Quelle und Bus-Client
- manuelle Aktionen: Quelle zeigen/verstecken/refresh
- spätere Automatik
