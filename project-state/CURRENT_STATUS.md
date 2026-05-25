# CURRENT_STATUS – Sound-System EventBus Debug Consumer

Aktueller Stand: STEP415 vorbereitet.

## Kurzfassung

Das Sound-System sendet parallel zum alten Sound-System-Flow `sound.*` Events an den Communication Bus.

Mit STEP415 kommt ein echter Debug-/Consumer-Client hinzu:

- Datei: `htdocs/public/tools/sound_eventbus_debug.html`
- Client-ID: `sound_eventbus_debug`
- Version: `1.0.0`
- Mode: `debug`
- Capability: `sound.event_output`

## Ziel

Der Debug-Client macht `sound.*` Events sichtbar und sorgt dafür, dass Sound-EventBus-Tests nicht mehr nur `deliveredCount: 0` zeigen, sondern an einen echten Consumer ausgeliefert werden können.

## Bestehender Sound-Flow bleibt unverändert

```text
/api/sound/*
→ Sound-System
→ Queue/Prioritäten/Playback
→ alter sound_system WebSocket
→ bestehende Overlays/Module
```

Zusätzlich:

```text
Sound-System
→ Communication Bus
→ channel: sound
→ target.capability: sound.event_output
→ sound_eventbus_debug
```

## Bewusst nicht geändert

- Sound-System-Backend
- Queue-Logik
- Prioritäten
- Bundle-/Lock-Logik
- Alert-Logik
- VIP-Logik
- DB-Schema
- Overlay-Designs
- alte `/api/sound/*` Routen
- alte `sound_system` WebSocket-Ausgabe
