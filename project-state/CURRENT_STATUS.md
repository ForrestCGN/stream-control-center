# Current Status

Stand: 2026-06-28

Aktuell: `0.2.22E - Local/Online OBS Status Parity read-only, fast gut`.

Umgesetzt und bestaetigt:

```text
- Stream-PC-Agent ist per WSS verbunden.
- Heartbeat ist schlank und stabil.
- Live-State sendet aktuelle OBS-Szene schnell.
- Inventory-Sync sendet Szenen/Quellen/Audio separat, nicht im Heartbeat.
- Online Inventory: 19 Szenen, 48 Quellen, 35 Audioquellen.
- Lokales Inventory: 19 Szenen, 48 Quellen, 35 Audioquellen.
- currentScene: Live Gameplay Forrest&Engel.
- Lokal/online Status-Parity fuer Live/Wartet vorbereitet.
```

Noch offen:

```text
- Mehrere echte Situationen testen: OBS an/aus, Agent an/aus, OBS-Neustart, Webserver-Neustart, Szenenwechsel.
- Pruefen, ob Live -> Wartet/Offline lokal und online ohne Reload sauber wirkt.
- Mod-Ansicht sprachlich vereinfachen: keine Diagnosebegriffe fuer Mods.
```

Weiterhin verboten:

```text
keine OBS-Steuerung
keine Agent-Actions
keine produktiven Writes
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions
keine freien OBS requestType Payloads
```
