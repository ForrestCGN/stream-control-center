# Overlay-Doku – Event Runtime Overlay

Datei: `htdocs/overlays/stream_events/event_runtime_overlay.html`  
Stand: `0.2.6`  
Zuletzt aktualisiert: 2026-06-16

## Aufgabe

Das Event Runtime Overlay zeigt für EventSound und spätere Eventphasen sichtbare Zustände an:

- Countdown `3 / 2 / 1`
- `LOS!` / „Jetzt raten!“
- Guessing-/Antwortphase
- später Ergebnis/Auswertung

## Aktueller Ablauf bei EventSound

```text
countdown.start -> 3 / 2 / 1
sound start -> Guessing sichtbar
sound end -> 2s Hold durch Sound-System Gap
hide -> Overlay blendet aus
```

## Bus/Fallback

Das Overlay versucht weiterhin, über den bestehenden Overlay-/Communication-Bus zu arbeiten. Da direkte Zustellung zeitweise `deliveredCount: 0` hatte, besitzt das Overlay zusätzlich einen Fallback über:

```text
GET /api/sound/event-preroll/status
```

Dadurch kann es Countdown-/Guessing-/Hide-Status auch ohne direkte Browser-Bus-Zustellung anzeigen.

## URL

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html
```

## Offene Punkte

- Direkte Bus-Registrierung/Capability später prüfen und robuster machen.
- Overlay-Design bleibt CGN-Stil: kompakt, oben mittig, nicht zu dominant.
- Ergebnis-/Auswertungsanimation später ergänzen.
- Dashboard-Konfiguration für Texte/Position/Countdown nur vorsichtig und streamerfreundlich planen.
