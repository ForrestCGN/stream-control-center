# STEP297 – SoundBus Debug View Test / Double Finished Note

Datum: 2026-05-24
Typ: Dokumentation / Diagnose

## Ausgangslage

Nach STEP296 wurde die neue Debug-View geöffnet:

```text
http://127.0.0.1:8080/public/tools/soundbus_debug_view.html
```

Ein `test_ping` wurde ausgelöst. Die View zeigte:

```text
SoundBus aktiv
Communication verfügbar
WS online
Client-ID soundbus_debug_view
Queue 0
Bundle Lock leer
Sound Fehler 0
failed=0 · device=0 · discord=0
emitted=152
```

Sichtbare Events:

```text
sound.starting Test Ping
sound.started Test Ping
sound.state.updated play_stream
sound.finished Test Ping
sound.finished auto_finished
```

## Bewertung

Die Debug-View funktioniert und empfängt `sound.*` Events live.

Der doppelt sichtbare `sound.finished`-Eintrag ist aktuell als Diagnose-/Darstellungsbefund dokumentiert:

1. `sound.finished Test Ping` enthält ein konkretes Sound-Item.
2. `sound.finished auto_finished` ist ein zusätzlicher System-/Auto-Finish-Status ohne normales Item-Payload.

Das ist nach dem beobachteten Test kein Hinweis auf doppelte Wiedergabe:

- Queue blieb leer.
- Bundle Lock blieb leer.
- Sound-Fehler blieben 0.
- Device-Fehler blieben 0.
- Discord-Fehler blieben 0.
- SoundBus blieb aktiv und erreichbar.

## Entscheidung

Keine Codeänderung in STEP297.

Der Befund wird nur dokumentiert, damit spätere Debug-/Dashboard-Views nicht irrtümlich zwei tatsächliche Sound-Enden oder doppelte Playback-Vorgänge interpretieren.

## Empfehlung für spätere UI-/Dashboard-Schritte

Eine spätere View kann `auto_finished` anders darstellen, zum Beispiel:

- als System-/Lifecycle-Event,
- weniger prominent,
- oder gruppiert unter dem vorherigen Item-Finish.

Das ist kosmetisch/diagnostisch und darf nicht mit Queue-, Bundle- oder Playback-Logik vermischt werden.

## Nicht geändert

- keine Backend-Dateien geändert
- keine Sound-Queue-Logik geändert
- keine Bundle-/`activeBundleLock`-Logik geändert
- keine SoundBus-Emission geändert
- keine Alert-/Discord-/TTS-/VIP-Module geändert
- keine DB-Migration
- keine Funktionalität entfernt
