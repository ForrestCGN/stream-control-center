# Overlay-Inventar aus `overlays.zip`

Stand: 2026-05-31

Diese Datei basiert auf dem hochgeladenen `overlays.zip`.

## Dateien mit WebSocket-/Bus-Bezug

| Datei | WebSocket | Bus-Hello | Bus-Heartbeat | Client-ID / Hinweis |
|---|---:|---:|---:|---|
| `overlays/_overlay-alerts-v2.html` | ja | ja | nein gefunden | `alert_overlay_v2_shadow` |
| `overlays/_overlay-alerts-v2-bus.html` | ja | kompatibel `type: hello` | kompatibel `type: heartbeat` | `overlay_alerts_v2_bus_bridge` |
| `overlays/sound_system_overlay.html` | ja | ja | nein gefunden | `sound_system_overlay_bus_consumer` |
| `overlays/vip_sound_overlay_v2.html` | ja | ja | nein gefunden | `vip_sound_overlay_v2` |
| `overlays/_overlay-deathcounter-v2.html` | ja | nein gefunden | nein gefunden | eigener WS, noch kein Bus-Monitoring |
| `overlays/_overlay-challenge_status.html` | ja | nein gefunden | nein gefunden | eigener WS, noch kein Bus-Monitoring |
| `overlays/_overlay-birthday.html` | ja | nein gefunden | nein gefunden | eigener WS, noch kein Bus-Monitoring |
| `overlays/_overlay-tts.html` | ja | nein gefunden | nein gefunden | eigener WS, noch kein Bus-Monitoring |
| `overlays/fireworks.js` | ja | nein gefunden | nein gefunden | alte/andere WS-Logik |
| `overlays/_overlay-start-v2-neon-galaxy.html` | ja | nein gefunden | nein gefunden | Chat-WS, kein Monitoring-Client |
| `overlays/_overlay-pause.html` | ja | nein gefunden | nein gefunden | Chat-WS, kein Monitoring-Client |
| `overlays/_overlay-bus-test.html` | via shared client | ja über shared | ja über shared | `overlay:bus_test` |
| `overlays/shared/overlay_bus_client.js` | ja | ja | ja | Standard-Client, sollte künftig bevorzugt werden |

## Bewertung

Für produktives Monitoring reichen die aktuellen Meldungen noch nicht.

Der Standard-Client `overlays/shared/overlay_bus_client.js` ist der beste Kandidat für einheitliches Monitoring, weil er bereits Hello, Heartbeat und Meta-Daten unterstützt.

Mehrere wichtige produktive Overlays nutzen aber eigene WebSocket-Logik und senden nur Hello oder gar keine Bus-Monitoring-Meldung.

## Empfehlung

1. Zuerst Bus-Logik korrigieren: Hello != Heartbeat.
2. Danach produktive Overlays schrittweise auf einheitliches Monitoring bringen.
3. Nicht alle alten WebSocket-Flows ersetzen; bestehende Funktionen bleiben erhalten.
4. Monitoring kann zusätzlich zum vorhandenen Overlay-Code eingebunden werden.
