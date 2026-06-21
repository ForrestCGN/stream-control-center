# STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX

## Ziel
Der offizielle Twitch-Shoutout darf erst nach dem echten Ende des Shouti-Clips gesendet werden. Der vorherige Schritt wartete korrekt auf das Sound-System, erhielt aber die `sound.finished` Events nicht, weil die Communication-Bus-Subscription eine nicht passende Capability gesetzt hatte.

## Änderung
Datei: `backend/modules/clip_shoutout.js`

- `MODULE_VERSION` auf `0.2.51` gesetzt.
- `MODULE_BUILD` auf `STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX` gesetzt.
- Sound-Finish-Subscription korrigiert:
  - vorher: `capability: 'sound.playback.consumer'`
  - jetzt: `capability: ''`
- Grund: Der Communication Bus matcht `subscription.capability` exakt gegen `<channel>.<action>`. Dadurch passte `sound.playback.consumer` nicht zu `sound.finished` / `sound.bundle.lock_finished`.
- `/api/clip-shoutout/status` gibt im `displayQueue` jetzt zusätzlich `soundSync` aus, damit sichtbar ist, ob der Listener installiert, beliefert und verarbeitet wurde.

## Nicht geändert
- Keine Rückkehr zur alten Timer-Logik.
- Keine Änderung an Auto-SO-Regeln.
- Keine Änderung am StreamDayLimit.
- Keine Änderung an Clip-Auswahl.
- Keine Änderung an Twitch-Sendelogik selbst.
- Keine Änderung an Dashboard, Texten oder DB-Daten.
- Keine Änderung an `sound_system.js` oder Overlays.

## Erwartetes Verhalten
1. `!so @user`
2. Clip wird ins Sound-System eingereiht.
3. Clip startet erst, wenn Sound-System frei ist.
4. Sound-System sendet `sound.finished` / `bundle.lock_finished`.
5. `clip_shoutout` verarbeitet das Event.
6. DisplayQueue wird auf `done` gesetzt.
7. Offizieller Twitch-Shoutout wird danach eingereiht/gesendet.

## Test
Nach Deploy + Node-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status" |
  Select-Object moduleVersion,moduleBuild

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s.displayQueue.soundSync | ConvertTo-Json -Depth 8
```

Erwartung:

```text
moduleVersion = 0.2.51
moduleBuild = STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX
soundSync.installed = true
```
