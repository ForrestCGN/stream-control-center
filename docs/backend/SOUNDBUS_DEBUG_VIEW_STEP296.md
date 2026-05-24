# STEP296 – SoundBus Debug/Monitoring View

Datum: 2026-05-24
Status: umgesetzt / bereit zum Test

## Ziel

Nach STEP295 bleibt `soundBus.enabled = true` im Dev-/Testbetrieb aktiv. STEP296 ergänzt eine beobachtende Debug-/Monitoring-View, damit SoundBus-Events und der aktuelle Sound-System-Status sichtbar geprüft werden können, bevor weitere Module oder Overlays auf den Bus migriert werden.

## Neue Datei

```text
htdocs/public/tools/soundbus_debug_view.html
```

URL:

```text
http://127.0.0.1:8080/public/tools/soundbus_debug_view.html
```

Optionale Parameter:

```text
?max=200          Maximale lokale Event-Anzahl
?statusMs=2000   Poll-Intervall für /api/sound/status
?ack=1           Debug-View sendet ACKs für empfangene Bus-Events
```

Standardmäßig sendet die View **keine ACKs**, damit sie die Produktions-/Testlogik nicht beeinflusst.

## Funktionen

- WebSocket-Registrierung als `soundbus_debug_view`
- Capabilities u. a. `sound.*`, `sound.queued`, `sound.started`, `sound.finished`, `sound.failed`
- Live-Status aus `/api/sound/status`
- Anzeige von:
  - SoundBus enabled/channel/requireAck
  - Communication Bus Verfügbarkeit
  - Queue-/Current-/Bundle-/activeBundleLock-Status
  - SoundBus emitted/errors/lastAction/lastReason
  - Sound-Fehler, Device-Fehler, Discord-Fehler
- Live-Eventliste für Bus-Events
- Filter nach Channel (`sound`/alle), Action und Suchtext
- Pause, Clear und JSON-Kopierfunktion
- Payload-Details pro Event einklappbar

## Nicht geändert

- Keine Backend-Logik geändert
- Keine Queue-/Bundle-/activeBundleLock-Logik geändert
- Keine SoundBus-Emit-Logik geändert
- Keine Alert-/Discord-/TTS-/VIP-Module geändert
- Keine DB-Migration

## Testplan

1. Datei entpacken.
2. Backend nur neu starten, falls statische Dateien nicht direkt aktualisiert werden.
3. URL öffnen:

```text
http://127.0.0.1:8080/public/tools/soundbus_debug_view.html
```

4. Erwartung im Header:

```text
WS: online
SoundBus: aktiv
Errors: 0
```

5. Einen kleinen Test-Sound auslösen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?id=test_ping"
```

6. Erwartung in der View:

- Events wie `sound.queued`, `sound.started`, `sound.finished` sichtbar
- `soundBus.errors = 0`
- Queue läuft wieder leer

## Bewertung

STEP296 ist ein Beobachtungs-/Diagnose-Step. Er schafft Sichtbarkeit für die kommenden Migrationen, ohne bestehende Wege zu verändern.
