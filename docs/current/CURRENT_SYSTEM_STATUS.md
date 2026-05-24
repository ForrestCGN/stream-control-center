# Current System Status

Stand: STEP297 – SoundBus Debug View Test dokumentiert
Aktualisiert: 2026-05-24T14:40:00Z

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
- Overlay Watchdog lief in den Tests mit `acknowledged`.

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
- STEP296 ergänzt `htdocs/public/tools/soundbus_debug_view.html` als beobachtende Debug-View.
- STEP297 bestätigt den Debug-View-Test mit `test_ping`.

## STEP297 Debug-View-Befund

Die Debug-View zeigte bei `test_ping` erwartete Live-Events:

```text
sound.starting Test Ping
sound.started Test Ping
sound.state.updated play_stream
sound.finished Test Ping
sound.finished auto_finished
```

Der doppelt sichtbare `sound.finished`-Eintrag wurde als Diagnose-/Darstellungsbefund dokumentiert. Das konkrete Item-Finish und das zusätzliche `auto_finished`-Lifecycle-Event bedeuten nach aktuellem Test keine doppelte Wiedergabe und keine Queue-Störung.

Bestätigter Status:

```text
Queue 0
Bundle Lock leer
failed=0
device=0
discord=0
SoundBus aktiv
WS online
```

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

STEP298 – SoundBus Consumer-/Dashboard-Planung.

Ziel: Nach bestätigter Debug-View gezielt entscheiden, ob zuerst Dashboard-Anzeige, Event-Korrelation oder Overlay-Consumer-Audit umgesetzt wird. Keine alte HTTP/WebSocket-Strecke entfernen.
