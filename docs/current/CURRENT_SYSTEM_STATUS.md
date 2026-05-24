# CURRENT SYSTEM STATUS – STEP310

Stand: 2026-05-24

## Aktueller Fokus

SoundBus ist nach STEP289–STEP310 als stabile Event-/Status-Schicht im Dev-/Testbetrieb aktiv.

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
- Dashboard Bus-Monitor funktioniert und ist rein lesend.

## STEP310 Ergebnis

SoundBus-Events enthalten jetzt einen normalisierten Consumer-Kontext für soundnahe Systeme.

Dadurch können folgende Quellen im Dashboard/Debug sauber unterschieden werden:

```text
Alert-Hauptsound
Alert-TTS
SoundAlerts / Channel Rewards
VIP-/Mod-Sounds
normales TTS
sonstige Sound-System-Caller
```

Zusätzlich hält das Sound-System einen kleinen Runtime-Cache:

```text
soundBus.recentEvents
```

Dieser Cache ist für Monitoring/Dashboard gedacht und verändert keine Playback-, Queue- oder Bundle-Logik.

## Nächster Schritt

Großer Folgeblock statt Mini-Steps:

```text
STEP320 – Sound Dashboard Control Center Block
```

Ziel:

- Queue und laufende Sounds besser steuerbar machen.
- Stop/Clear/Pause/Resume sauber mit Rechte-/Auth-Konzept vorbereiten.
- SoundBus/Queue/Fehler im Dashboard zusammenführen.
- Keine Bus-only-Migration ohne separaten Test.
