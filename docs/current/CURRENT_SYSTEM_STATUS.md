# Current System Status

Stand: STEP296 – SoundBus Betriebsentscheidung
Aktualisiert: 2026-05-24T14:35:00Z

## Aktueller Fokus

Kommunikations-/Sound-/Alert-Stabilisierung über Communication Bus, ohne bestehende Produktionswege zu entfernen.

## Alert-System

- Alert native Output Mode vorhanden.
- Getestete Modi:
  - `legacy`
  - `legacy_and_bus`
  - `bus_first`
- `bus_only` ist vorbereitet, aber nicht freigegeben.
- Produktiv sicherer Standard bleibt weiterhin `legacy`, solange kein expliziter Testbetrieb gewünscht ist.
- Overlay Watchdog läuft und meldete in den Tests `acknowledged`.

## Sound-System / SoundBus

- Sound-System bleibt Master für Audio, Queue, Bundles und Prioritäten.
- SoundBus ist als Event-/Status-Schicht ergänzt.
- `/api/sound/status` enthält Top-Level `soundBus`.
- SoundBus wurde aktiviert und getestet.
- Einzel-Sound-Test bestanden.
- Alert-Bundle-Test bestanden.
- V5 Real Queue/Bundle Regression bestanden.
- SoundBus verursacht keine Queue-/Bundle-Störung.
- STEP295-Entscheidung: `soundBus.enabled = true` bleibt im Dev-/Testbetrieb aktiv.

## Discord Media Resolver

STEP291 zeigte einen Nebenbefund:

```text
discordFailed = 3
sound nicht gefunden: media/alerts/bits/100-249.mp3
```

STEP292 grenzte dies als Discord-Pfadresolver-Problem ein. STEP293 erweiterte `backend/modules/discord.js` für Media-Registry-Pfade. STEP294 bestätigte den Retest:

```text
discordFailed = 0
failed = 0
deviceFailed = 0
queuedCount = 0
activeBundleLock = leer
bundlesQueued = 3
bundleItemsQueued = 6
```

## Betriebsentscheidung STEP295

`soundBus.enabled = true` bleibt aktiv für weitere Debug-/Monitoring-/Dashboard-Arbeiten.

Diese Entscheidung ist keine Freigabe für:

- Bus-only Sound-Overlays,
- Entfernen alter WebSocket-/HTTP-Wege,
- direkte Caller-Modul-Migration auf Bus,
- Änderungen an Queue/Bundle/`activeBundleLock`,
- Alert `bus_only` als Produktivmodus.

## Wichtige Schutzregeln

- Keine Funktionalität entfernen.
- Keine Sound-Queue-Logik ändern, wenn nur Bus/Status/Resolver betroffen ist.
- `activeBundleLock` nicht ohne gezielte Regressionstests anfassen.
- SQLite nicht überschreiben oder neu bauen.
- Dashboard nur über APIs, nicht direkt auf Dateien/SQLite.
- Nach Codeänderungen Syntaxcheck und Tests dokumentieren.

## Nächster empfohlener Schritt

STEP296 – SoundBus Debug/Monitoring View.

Ziel: `sound.*` Events, `soundBus.stats`, LastAction, LastReason, LastEventId, Errors und Skipped sichtbar machen, ohne Playback-/Queue-/Bundle-Logik zu ändern.


## STEP296 – SoundBus Debug/Monitoring View

Status: umgesetzt / bereit zum Test.

Neue Debug-View:

```text
http://127.0.0.1:8080/public/tools/soundbus_debug_view.html
```

Die View registriert sich per WebSocket als `soundbus_debug_view`, liest `/api/sound/status` und zeigt `sound.*` Events filterbar an. Sie ist beobachtend; ACKs sind standardmäßig deaktiviert und nur optional per `?ack=1` möglich. Bestehende Sound-/Queue-/Bundle-/Alert-/Discord-Logik wurde nicht geändert.
