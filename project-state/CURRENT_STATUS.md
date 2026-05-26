# CURRENT_STATUS

Stand: 2026-05-26 / STEP487_COMMUNICATION_BUS_MODULE_CONTRACT

## Aktueller Arbeitsstand

STEP487 ergänzt eine optionale Backend-Modul-zu-Modul-Vertragsschicht für den bestehenden Communication Bus.

## Communication Bus / EventBus

- Neuer Helper: `backend/modules/helpers/helper_communication_contract.js`.
- Version: `0.1.0`.
- Zweck: Module können sich anmelden, abmelden, Heartbeats/Status senden, Events senden und relevante Events abonnieren.
- Bestehende produktive Bus-/WebSocket-/Replay-/ACK-Flows werden nicht ersetzt.
- `communication_bus.js` und `helper_communication.js` wurden bewusst nicht geändert.
- Der neue Contract ist Opt-in über `ensureModuleBus(bus)`.

## Wichtig

- Keine Datenbankänderung.
- Keine neuen HTTP-Routen.
- Kein Dashboard-Umbau.
- Kein Command-System-Umbau.
- Kein Sound-System-Umbau.
- Kein Kanalpunkte-Modul gebaut.

## Offene Shoutout-Punkte aus STEP486 bleiben bestehen

- Produktionscheck lokal ausführen.
- Live-Test lokal ausführen.
- Debug-Inbound-Event lokal ausführen.
- Echte Twitch-Shoutout-Events beobachten.
- Produktive `!so`-Umstellung nur ausdrücklich und nach Prüfung.

## Nächster sinnvoller Schritt

`STEP488_CHANNELPOINTS_BACKEND_SKELETON`

Dabei soll das neue Kanalpunkte-Modul als erstes Fachmodul den Communication-Bus-Contract nutzen.
