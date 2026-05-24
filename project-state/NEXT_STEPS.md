# NEXT STEPS – nach STEP354 SOUND BUS FINAL CHECK

## Nächster Block

`STEP360 – Alert-System an fertigen SoundBus anbinden`

## Ziel

Das Alert-System wird als erstes System an den jetzt bestätigten SoundBus-/Sound-System-Stand angebunden.

Klarer Zusammenhang:

```text
Sound-System steuert Sound, Queue, Bundle und Playback.
SoundBus meldet Start/Ende/Client-Bestätigung.
Alert-System liefert Alert-Inhalt und Overlay-Anzeige passend dazu.
```

## Vor STEP360 prüfen

- Aktuelle `backend/modules/alert_system.js` aus GitHub/dev lesen.
- Aktuelle `backend/modules/sound_system.js` aus GitHub/dev lesen.
- Aktuelle Alert-Overlays lesen:
  - `htdocs/overlays/_overlay-alerts-v2.html`
  - `htdocs/overlays/_overlay-alerts-v2-bus.html`
- Keine alten Annahmen aus früheren Chats verwenden.

## STEP360-Kernziel

- Alert-System nutzt Sound-System/SoundBus-Signale sauber.
- Alert-Bild/Text wird passend zum tatsächlichen Sound-Start angezeigt.
- Reconnect-/Recovery-Verhalten für laufende Alerts prüfen und gezielt lösen.
- Sound/TTS darf dabei nicht doppelt starten.

## Bewusst später

- Dashboard-Ausbau.
- Dashboard-Feinschliff.
- Neue Dashboard-Tabs.
- UI-Monitoring als Hauptarbeit.

## Nicht machen ohne ausdrücklichen Wunsch

- Kein `bus_only` als Produktionsstandard.
- Keine Entfernung alter Legacy-/HTTP-/WebSocket-Pfade.
- Keine Sound-Queue-Logik ändern.
- Keine Bundle-/`activeBundleLock`-Logik ändern.
- Keine DB-Migration.
- Keine neue Parallelstruktur.
