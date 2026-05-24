# CURRENT_STATUS – STEP310

Stand: 2026-05-24

Aktueller Stand:

- SoundBus ist aktiv und getestet.
- Discord Media Path Resolver ist gefixt und bestätigt.
- SoundBus Debug View ist verfügbar.
- Dashboard SoundBus Monitoring ist verfügbar.
- SoundBus-Events enthalten jetzt normalisierte Consumer-Kontexte.
- Dashboard Bus-Monitor zeigt aktuelle SoundBus-Events und Quellen an.

Aktuelle Betriebsentscheidung:

```text
soundBus.enabled = true
```

Wichtig:

- Keine vollständige Bus-only-Migration.
- Bestehende HTTP-/WebSocket-Wege bleiben erhalten.
- Keine Queue-/Bundle-/Playback-Logik verändert.
- Weitere Consumer/Migrationen nur in größeren, sinnvollen Blöcken.

Nächster großer Schritt:

```text
STEP320 – Sound Dashboard Control Center Block
```
