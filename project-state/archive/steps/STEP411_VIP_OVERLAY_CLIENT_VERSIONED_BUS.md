# STEP411 VIP Overlay Client Versioned Bus Registration

Datum: 2026-05-25

## Ziel

Der VIP-Overlay-Client `vip_sound_overlay_v2.html` wurde von alten STEP-/Shadow-Begriffen auf echte Versions- und Capability-Angaben umgestellt.

## Geänderte Datei

- `htdocs/overlays/vip_sound_overlay_v2.html`

## Änderungen

- Neuer Client-Metadatenblock:
  - `VIP_OVERLAY_CLIENT_ID = "vip_sound_overlay_v2"`
  - `VIP_OVERLAY_CLIENT_MODULE = "vip_sound_overlay"`
  - `VIP_OVERLAY_CLIENT_VERSION = "1.0.0"`
  - `VIP_OVERLAY_CLIENT_MODE = "preview"`
- WebSocket-`bus_hello` nutzt jetzt Version `1.0.0` statt `STEP403`.
- Capabilities sind zentral definiert und enthalten zusätzlich `vip.sound.status_events`.
- ACK-Details enthalten jetzt `clientVersion`, `mode: "preview"` und keine STEP-Kennung mehr.
- Debug-Texte wurden von Shadow-Begriffen auf Preview-/Client-Begriffe bereinigt.

## Bewusst nicht geändert

- Kein Sound-System-Umbau.
- Keine Queue-Änderung.
- Keine Änderung am produktiven VIP-/Mod-Sound-Flow.
- Keine Daily-Usage-Änderung.
- Kein Overlay-Design-Umbau.
- Keine Backend-Routen.
- Keine DB-Migration.

## Tests

Empfohlen nach Entpacken und Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/command?login=forrestcgn&displayName=ForrestCGN&targetLogin=araglor&targetDisplayName=araglor&source=step411-test&trigger=!vip&actorIsBroadcaster=true" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/status" | ConvertTo-Json -Depth 10
```

## Erwartung

- Communication Bus Client `vip_sound_overlay_v2` meldet `version: "1.0.0"`.
- Client-Modus ist `preview`, nicht mehr `shadow`.
- `vip.sound` wird weiterhin an `vip_sound_overlay_v2` geliefert.
- Sound-System-Flow bleibt unverändert.
