# Current Status

Stand: 2026-06-29

Aktuell: `RDAP_0.2.23_PARK_OBS_START_MEDIA_DOCS` - Doku-only: OBS geparkt, Media-System wird naechster Fokus.

## OBS-Stand beim Parken

```text
0.2.22E - Local/Online OBS Status Parity read-only, fast gut.
```

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

Offen, aber geparkt in `project-state/PARKED_TODOS.md`:

```text
- Mehrere echte Situationen testen: OBS an/aus, Agent an/aus, OBS-Neustart, Webserver-Neustart, Szenenwechsel.
- Pruefen, ob Live -> Wartet/Offline lokal und online ohne Reload sauber wirkt.
- Mod-Ansicht sprachlich vereinfachen: keine Diagnosebegriffe fuer Mods.
```

## Neuer Fokus

```text
Media-System ins Remote-Modboard bringen.
```

Naechster fachlicher Schritt:

```text
- Zuerst echte Media-/Sound-/Dashboard-Dateien aus GitHub/dev lesen.
- Bestehende Media-/Sound-Struktur aufnehmen.
- Danach ersten kleinen read-only Integrationsplan fuer das Remote-Modboard machen.
- Keine Uploads, Deletes, produktiven Writes oder DB-Migrationen im ersten Media-Step ohne separate Freigabe.
```

Weiterhin verboten:

```text
keine OBS-Steuerung
keine Agent-Actions
keine produktiven Writes
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions
keine freien OBS requestType Payloads
keine Secrets in Logs, Status, UI oder Doku
```
