# CURRENT_STATUS – STEP298

Stand: 2026-05-24

Aktueller Stand:

- SoundBus ist aktiv und getestet.
- Discord Media Path Resolver ist gefixt und bestätigt.
- SoundBus Debug View ist verfügbar.
- Consumer-/Dashboard-Planung ist dokumentiert.

Aktuelle Betriebsentscheidung:

```text
soundBus.enabled = true
```

Wichtig:

- Keine vollständige Bus-only-Migration.
- Bestehende HTTP-/WebSocket-Wege bleiben erhalten.
- Weitere Consumer/Migrationen nur schrittweise.

Nächster Schritt:

STEP299 – Sound Dashboard Monitoring Modul Plan/Scaffold.


## STEP299 – Sound Dashboard Monitoring Modul

Das bestehende Dashboard-Modul `Sound-System` enthält nun einen neuen rein lesenden Tab `Bus-Monitor`.

Der Tab zeigt SoundBus-/Communication-/Queue-/Bundle-/Fehlerstatus aus `/api/sound/status` und verlinkt die bestehende Debug View `/public/tools/soundbus_debug_view.html`.

Es wurden keine Backend-, Sound-, Queue-, Bundle-, Alert-, Discord-, TTS- oder VIP-Logiken geändert.
