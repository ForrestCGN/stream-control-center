# CURRENT SYSTEM STATUS – STEP302

Stand: 2026-05-24

## Aktueller Fokus

SoundBus ist als stabile Event-/Status-Schicht im Dev-/Testbetrieb aktiv.

```text
soundBus.enabled = true
```

Dies ist keine vollständige Bus-only-Produktivmigration. Bestehende HTTP-/WebSocket-Wege bleiben aktiv.

## Bestätigte Punkte

- SoundBus-Basis-Events funktionieren.
- `/api/sound/status` enthält Top-Level `soundBus`.
- Einzel-Sound `test_ping` erfolgreich.
- Alert-Bundle mit Sound + TTS erfolgreich.
- V5 Queue-/Bundle-Regression bestanden.
- Discord Media Path Resolver Fix bestätigt.
- SoundBus Debug View funktioniert.
- Dashboard Bus-Monitor funktioniert.
- Dashboard Backend/Auth Validation bestanden mit Hinweis.

## STEP302 Ergebnis

Der Button **Status neu laden** im Dashboard-Tab **SoundBus Monitoring** ist jetzt rein lesend.

Der Bus-Monitor nutzt dafür eine eigene Action `refresh-status`, die nur `GET /api/sound/status` ausführt.

Der globale Sound-System-Button **Neu laden** bleibt unverändert und kann weiterhin die bestehende Reload-Backend-Aktion ausführen.

## Nächster Schritt

STEP303 – Sound Dashboard Readonly Refresh Test dokumentieren.
