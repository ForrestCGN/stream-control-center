# CURRENT_STATUS – STEP301

Stand: 2026-05-24

Aktueller Stand:

- SoundBus ist aktiv und getestet.
- Discord Media Path Resolver ist gefixt und bestätigt.
- SoundBus Debug View ist verfügbar.
- Sound Dashboard Monitoring Modul ist sichtbar getestet.
- Dashboard-/Auth-/Backend-Einbindung wurde geprüft.

Aktuelle Betriebsentscheidung:

```text
soundBus.enabled = true
```

Wichtig:

- Keine vollständige Bus-only-Migration.
- Bestehende HTTP-/WebSocket-Wege bleiben erhalten.
- Weitere Consumer/Migrationen nur schrittweise.

STEP301 Ergebnis:

- Integration strukturell korrekt.
- Keine neuen Backend-/Auth-Routen nötig.
- Hinweis: Bus-Monitor-Button `Status neu laden` sollte in STEP302 auf reinen Status-Refresh umgestellt werden.

Nächster Schritt:

STEP302 – Sound Dashboard Bus-Monitor Readonly Refresh Fix.
