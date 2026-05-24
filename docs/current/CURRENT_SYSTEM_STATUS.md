# CURRENT SYSTEM STATUS – STEP303

Stand: 2026-05-24

## Aktueller Fokus

SoundBus ist im Dev-/Testbetrieb aktiv und wird im Dashboard lesend überwacht.

Aktuelle Entscheidung:

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
- Dashboard Bus-Monitor ist vorhanden und lesend.
- Bus-Monitor Refresh nutzt nur `GET /api/sound/status`.

## STEP303 Ergebnis

Der Dashboard Bus-Monitor aktualisiert sich automatisch alle 5 Sekunden, solange der Tab aktiv ist.

Nicht geändert:

```text
keine Sound-/Queue-/Bundle-Logik
kein SoundBus-Umbau
keine Backend-Routen
keine DB-Migration
```

## Nächster Schritt

STEP304 – Sound Dashboard Bus-Monitor Auto Refresh Live-Test dokumentieren.
