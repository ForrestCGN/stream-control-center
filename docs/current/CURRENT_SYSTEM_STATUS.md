# CURRENT SYSTEM STATUS – STEP298

Stand: 2026-05-24

## Aktueller Fokus

SoundBus ist nach STEP289–STEP297 als stabile Event-/Status-Schicht im Dev-/Testbetrieb aktiv.

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

## STEP298 Ergebnis

SoundBus Consumer-/Dashboard-Planung wurde dokumentiert.

Festlegung:

- Beobachter dürfen Events lesen, aber standardmäßig nicht ACKen.
- Dashboard nutzt Bus für Live-Anzeige/Monitoring, Steuerung weiterhin über Backend-APIs.
- Overlay-Consumer erst nach separater Freigabe.
- Module bleiben vorerst API-basiert.
- Weitere Migrationen nur schrittweise und mit Fallback.

## Nächster Schritt

STEP299 – Sound Dashboard Monitoring Modul Plan/Scaffold.
