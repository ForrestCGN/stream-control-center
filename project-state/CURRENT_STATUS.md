# CURRENT_STATUS – Sound-System EventBus Baseline

Aktueller Stand: STEP412 vorbereitet.

## Kurzfassung

Das Sound-System ist jetzt für parallele EventBus-Ausgabe vorbereitet und versioniert.

- Modul: `sound_system`
- Version: `0.1.13`
- Capability: `sound.event_output`
- Status-API-Version: `1.0.0`
- Bus-Channel: `sound`
- Bus-Modus: `legacy_parallel`

## Ziel

Sound-System, Alert-System und VIP-System sollen langfristig über den Communication Bus laufen.

Dieser STEP beginnt bewusst beim Sound-System, weil es die zentrale Audio-/Medien-Schicht ist.

## Wichtig

Der alte Sound-System-Flow bleibt bestehen.

Das bedeutet:

```text
Bestehende Module → /api/sound/* → Sound-System → alter WebSocket/Playback
```

läuft weiter.

Parallel sendet das Sound-System Bus-Events:

```text
Sound-System → Communication Bus → sound.*
```

## Neue Routen

```text
/api/sound/eventbus/status
/api/sound/eventbus/test
/api/sound/eventbus/reset
```

## Bewusst nicht geändert

- Keine Queue-Änderung
- Keine Prioritätsänderung
- Keine Bundle-Lock-Änderung
- Keine Alert-Änderung
- Keine VIP-Änderung
- Keine DB-Migration
- Keine Overlay-Designänderung

## Nächster sinnvoller Schritt

STEP413 – Sound-System EventBus echten Playback-/Queue-Test durchführen und prüfen, ob `sound.started`, `sound.finished` und `sound.queue.updated` sauber im Bus sichtbar werden.
