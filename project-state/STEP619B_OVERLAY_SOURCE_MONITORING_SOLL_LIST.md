# STEP619B – Overlay-Quellen-Monitoring Soll-Liste

Stand: 2026-05-31
Status: Planung / Dokumentation
Scope: keine Code-Änderung, keine OBS-Aktion, keine Automatik, keine DB-Migration.

## Ziel

Überwacht werden sollen nicht nur Overlay-Clients, die sich am Communication-Bus melden, sondern alle wichtigen in OBS eingebundenen Overlay-Quellen, besonders solche, die im Normalzustand unsichtbar sind und nur auf Aktionen warten.

Wichtig sind insbesondere:

- Alerts
- VIP-Overlay
- Sound-System / Sound-Overlay
- Deathcounter
- Challenge-Status
- Birthday
- TTS
- Fireworks
- Start / Pause / Ende
- Mega-Shoutout
- Clip-Player / Media-Player

## Grundsatz

Ein Overlay gilt künftig nicht einfach als „online“, nur weil ein Bus-Client existiert.

Der Status muss aus mehreren Ebenen gebaut werden:

1. OBS-Ebene
   - OBS verbunden?
   - Browserquelle vorhanden?
   - Quelle in Szene eingebunden?
   - Quelle sichtbar/unsichtbar?
   - Browserquelle URL/Datei vorhanden?

2. Bus-Ebene
   - Client registriert?
   - WebSocket verbunden?
   - echter Heartbeat vorhanden?
   - letzter Hello?
   - letzter Heartbeat?
   - Herkunft/URL/User-Agent/Mode?

3. Modul-Ebene
   - Backend-Modul vorhanden/geladen?
   - Modulstatus ok?
   - Overlay wartet korrekt auf Aktionen?
   - letzte Fehler/Event-Hinweise?

## Begriffe

- **OBS-Quelle vorhanden**: Die Browserquelle existiert in OBS.
- **OBS-Quelle eingebunden**: Die Quelle liegt als Scene Item in einer Szene.
- **OBS-Quelle sichtbar**: Scene Item ist enabled. Unsichtbar kann korrekt sein, wenn Overlay nur bei Event sichtbar wird.
- **Bus registriert**: Overlay/Client hat `bus_hello` gesendet.
- **Heartbeat aktiv**: Overlay/Client sendet regelmäßig echten Heartbeat.
- **Bereit**: Quelle ist vorhanden, erwarteter Client ist registriert/Heartbeat ok oder bewusst als Event-only markiert.
- **Nur angemeldet**: `hello`, aber kein echter Heartbeat.
- **OBS unbekannt/offline**: OBS nicht erreichbar, daher keine Aussage über Quelle möglich.

## Aktuelle Feststellung aus Upload `overlays.zip`

Mehrere Overlays verbinden sich per WebSocket, aber nicht alle senden echte Bus-Heartbeats.

Kritisch: `bus_hello` darf künftig nicht mehr automatisch wie „echter Heartbeat“ bewertet werden.

## Vorläufige Soll-Liste

| Key | Anzeige | Overlay-Datei | Aktueller Bus-Client | Aktueller Bus-Stand | Spätere Priorität |
|---|---|---|---|---|---|
| alerts_v2 | Alerts V2 | `overlays/_overlay-alerts-v2.html` | `alert_overlay_v2_shadow` | `bus_hello`, kein klarer Heartbeat | Hoch |
| alerts_v2_bus_bridge | Alerts V2 Bus Bridge | `overlays/_overlay-alerts-v2-bus.html` | `overlay_alerts_v2_bus_bridge` | eigener `hello`/`heartbeat`, Typ `hello`/`heartbeat` statt `bus_hello`/`bus_heartbeat` | Hoch, prüfen |
| sound_system | Sound-System Overlay | `overlays/sound_system_overlay.html` | `sound_system_overlay_bus_consumer` | `bus_hello`, kein echter Heartbeat gefunden | Hoch |
| vip_v2 | VIP Sound Overlay V2 | `overlays/vip_sound_overlay_v2.html` | `vip_sound_overlay_v2` | `bus_hello`, kein echter Heartbeat gefunden | Hoch |
| deathcounter_v2 | Deathcounter V2 | `overlays/_overlay-deathcounter-v2.html` | noch nicht sauber als Bus-Client erfasst | WebSocket vorhanden, Bus-Registrierung offen | Hoch |
| challenge_status | Challenge Status | `overlays/_overlay-challenge_status.html` | noch nicht sauber als Bus-Client erfasst | WebSocket vorhanden, Bus-Registrierung offen | Hoch |
| birthday | Birthday Overlay | `overlays/_overlay-birthday.html` | noch nicht sauber als Bus-Client erfasst | WebSocket vorhanden, Bus-Registrierung offen | Mittel |
| tts | TTS Overlay | `overlays/_overlay-tts.html` | noch nicht sauber als Bus-Client erfasst | WebSocket vorhanden, Bus-Registrierung offen | Mittel |
| fireworks | Fireworks | `overlays/_overlay-fireworks.html`, `overlays/fireworks.html/js` | noch nicht Bus-konform | eigene/alte WS-Logik vorhanden | Mittel |
| mega_shoutout | Mega-Shoutout | `overlays/_overlay-megashoutout.html` | offen | kein eindeutiger Bus-Client im Upload | Mittel |
| start_v2 | Start Overlay V2 | `overlays/_overlay-start-v2-neon-galaxy.html` | offen | WebSocket-Chat vorhanden, kein Monitoring-Client | Niedrig/Mittel |
| pause | Pause Overlay | `overlays/_overlay-pause.html` | offen | WebSocket-Chat vorhanden, kein Monitoring-Client | Niedrig/Mittel |
| end | Ende Overlay | `overlays/_overlay-ende.html` | offen | kein eindeutiger Bus-Client im Upload | Niedrig/Mittel |
| clip_player | Clip Player | `overlays/_overlay-clip_player.html` | offen | kein eindeutiger Bus-Client im Upload | Niedrig |
| media_player | Media Player | `overlays/_overlay-media-player.html` | offen | kein eindeutiger Bus-Client im Upload | Niedrig |

## Bewertung für wartende Overlays

Overlays wie Alerts, VIP, Sound, Deathcounter und Challenge dürfen im Ruhezustand nicht als Fehler gelten, nur weil sie gerade nichts anzeigen.

Gültige Zustände:

- `ready_waiting` – Quelle vorhanden, Client bereit, wartet auf Event.
- `active_visible` – Quelle aktiv und Overlay gerade sichtbar/arbeitet.
- `source_hidden_expected` – Quelle bewusst versteckt, kein Fehler.
- `source_missing` – erwartete OBS-Quelle fehlt.
- `bus_missing` – erwarteter Bus-Client fehlt.
- `hello_only` – Client hat sich angemeldet, aber sendet keinen echten Heartbeat.
- `heartbeat_stale` – Heartbeat ist zu alt.
- `obs_offline` – OBS ist nicht erreichbar, Status nicht endgültig bewertbar.

## Nicht umgesetzt in diesem Step

- keine Änderung an Dashboard-Code
- keine Änderung an Backend-Code
- keine DB-Tabelle angelegt
- keine OBS-Aktionen
- kein Auto-Refresh/Repair
- kein Ein-/Ausblenden
