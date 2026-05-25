# NEXT STEPS – nach STEP406 VIP PRODUCTIVE BUS EVENT AUDIT

## Nächster empfohlener Schritt

`STEP407 – VIP Productive Bus Mirror Design`

## Ziel

Einen sauberen Eventvertrag für spätere echte VIP-/Mod-Bus-Mirror-Events entwerfen, ohne den produktiven Sound-System-Pfad umzubauen.

## Leitentscheidung

```text
Sound-System bleibt führend für Audio, Queue, Timing und Playback.
Communication Bus darf ergänzende Mirror-/Diagnose-Events bekommen.
Overlay-Anzeige wird nicht automatisch auf Bus-Produktion umgestellt.
```

## Zu klären in STEP407

- Welche Eventnamen werden verwendet?
- Empfehlung aktuell eher `vip.sound.*` als produktiver Mirror statt `vip.overlay.*` als Anzeige-Trigger.
- Welche Payload-Felder sind Pflicht?
- Welche Korrelation braucht Sound-System/SoundBus?
- Wie wird doppelte Anzeige verhindert?
- Welche Feature-Flag-/Setting-Strategie wird genutzt?
- Welche Tests sind minimal nötig?

## Mögliche Eventnamen

```text
vip.sound.requested
vip.sound.accepted
vip.sound.queued
vip.sound.rejected
vip.sound.duplicate
vip.sound.started
vip.sound.finished
vip.sound.failed
```

## Nicht machen ohne eigenen STEP

- Kein produktives `vip.overlay.show` für echte VIP-/Mod-Sounds.
- Keine Entfernung der Sound-System-Anzeige.
- Keine Änderung an `/api/sound/play`.
- Keine Queue-/Prioritätsänderung.
- Keine Daily-Usage-Änderung.
- Keine DB-Migration.
- Kein Dashboard-Umbau.
- Keine Registrierung von `/api/vip`.
