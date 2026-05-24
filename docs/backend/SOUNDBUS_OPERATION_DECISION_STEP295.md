# STEP295 – SoundBus Betriebsentscheidung

Stand: 2026-05-24T14:35:00Z
Typ: Entscheidung / Dokumentation
Codeänderung: nein

## Entscheidung

`soundBus.enabled = true` bleibt im aktuellen Dev-/Teststand aktiv.

Das ist keine vollständige Produktiv-Migrationsfreigabe aller Module auf den Communication Bus. Es ist die Freigabe, den SoundBus als stabile Event-/Status-Schicht im weiteren Entwicklungs- und Testbetrieb eingeschaltet zu lassen.

## Begründung

Die folgenden Tests wurden erfolgreich bestätigt:

- STEP289/289B: SoundBus Event Output und Top-Level-Status vorhanden.
- STEP290: Basistests bestanden.
- STEP291: V5 Real Queue/Bundle Regression mit SoundBus bestanden.
- STEP293/294: Discord Media Path Resolver Fix bestätigt, `discordFailed = 0` im Retest.

Der Retest nach STEP293 zeigte:

```text
queuedCount = 0
currentBundle = leer
activeBundleLock = leer
failed = 0
deviceFailed = 0
discordFailed = 0
bundlesQueued = 3
bundleItemsQueued = 6
soundBus.enabled = true
```

Damit ist bestätigt, dass der SoundBus die bestehende Queue-/Bundle-Reihenfolge nicht stört und der Discord-Pfadfehler behoben ist.

## Betriebsmodus ab STEP295

Für weitere Entwicklungsarbeit gilt:

```text
soundBus.enabled = true
```

Zulässige Nutzung:

- Debugging und Monitoring von Sound-System-Events.
- Erweiterung von Debug-/Dashboard-Anzeigen.
- Vorbereitung von Bus-Consumern.
- Analyse von Eventflüssen zwischen Sound-System, Alerts, Overlays und Discord.

Noch nicht freigegeben:

- vollständige Umstellung bestehender Sound-Overlays vom alten WebSocket auf Bus-only.
- direkte Umstellung von Caller-Modulen auf Bus-Input.
- Entfernen alter `/api/sound/*` Routen.
- Entfernen des alten `op: sound_system` WebSocket.
- Produktivsetzung von Alert `bus_only`.

## Schutzregeln

Bei den nächsten Schritten ausdrücklich nicht ändern:

- Sound-Queue-Logik
- Bundle-/`activeBundleLock`-Logik
- Alert-Output-Modi
- Caller-Modul-Aufrufe zu `/api/sound/play` und `/api/sound/bundle`
- SQLite-Schema ohne separaten Plan

## Nächster empfohlener Block

STEP296 – SoundBus Debug/Monitoring View

Ziel:

- Communication Debug View oder ein eigenes Debug-Panel so erweitern, dass `sound.*` Events sichtbar und filterbar sind.
- `soundBus.stats` übersichtlich anzeigen.
- LastAction, LastReason, LastEventId, Errors und Skipped sichtbar machen.
- Keine Queue-/Bundle-/Playback-Logik ändern.

Alternative nächste Blöcke:

- Sound-System Overlay Consumer Audit.
- Dashboard-Anzeige für SoundBus/Queue/Discord-Fehler.
