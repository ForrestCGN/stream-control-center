# Current Status

## Stand

Aktueller Fokus: VIP30 / 30 Tage VIP im `stream-control-center`.

VIP30-STEP1 wurde vorbereitet als neuer Node-basierter Grundstand:

```text
backend/modules/vip30.js
config/vip30.json
docs/modules/vip30.md
```

## Festlegungen

```text
- kein Streamer.bot fuer VIP30
- kein Import aus altem vip_slots.json
- Reward im bestehenden Channelpoints-Modul
- Kosten: 50000 Kanalpunkte
- Laufzeit: 30 Tage
- Max Slots: 10
- Logs/Statistiken ueber SQLite/API/Dashboard, keine normalen Server-Logs
- Communication-Bus: registerModule, heartbeatModule, publishModuleStatus
- Alert spaeter bevorzugt ueber Sound-System-Overlay
- Texte spaeter als Dashboard-Varianten im CGN/Altersheim/Rentner-Stil
```

## STEP1 Umfang

```text
- SQLite Tabellen vip30_slots und vip30_log
- /api/vip30/status
- /api/vip30/health
- /api/vip30/slots
- /api/vip30/logs
- /api/vip30/stats
- Diagnose-Registry-Erweiterung fuer VIP30 vorgesehen
```

## Noch nicht aktiv

```text
- kein Twitch Add VIP
- kein Twitch Remove VIP
- kein Fulfill/Cancel
- keine Channelpoints-Execution-Anbindung
- kein Dashboard-UI
```

## Naechster Fokus

VIP30-STEP2: Twitch Capability Check fuer `channel:manage:redemptions` und `channel:manage:vips`, danach gezielte Channelpoints-Action-Anbindung.
