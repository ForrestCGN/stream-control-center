# STEP_SO_SYNC_OFFICIAL_AFTER_REAL_CLIP_END

## Ziel
Der offizielle Twitch-Shoutout wird erst nach dem echten Ende des Shouti-Clips ausgelöst.

## Hintergrund
Vorher hat `clip_shoutout.js` nach dem Einreihen des Sound-System-Bundles einen lokalen Timer anhand der geschätzten Clip-Dauer gestartet. Wenn das Sound-System gerade beschäftigt war, lag der Shouti-Clip korrekt in der Sound-Queue, aber der offizielle Twitch-Shoutout konnte schon ausgelöst werden, bevor der Clip tatsächlich sichtbar lief.

## Änderung
- `clip_shoutout.js` hört jetzt auf Sound-System-Bus-Events des konkreten `clip_shoutout`-Bundles.
- Die DisplayQueue bleibt `active`, bis das Sound-System für das konkrete Clip-Item ein echtes Ende meldet.
- Erst dann wird der DisplayQueue-Eintrag auf `done` gesetzt.
- Erst danach wird der offizielle Twitch-Shoutout eingereiht/gesendet.
- Doppelte Sound-Ende-Events werden über `display_queue_id`/Status/History abgefangen.

## Nicht geändert
- Auto-SO-Regeln
- StreamDayLimit
- Clip-Auswahl
- Twitch-API-Sendelogik selbst
- Texte
- Dashboard
- bestehende DB-Daten
- Sound-System-Datei
- Overlay-Datei

## Betroffene Datei
- `backend/modules/clip_shoutout.js`

## Test
1. Einen langen Sound oder ein anderes Sound-System-Item starten, damit das Sound-System busy ist.
2. Danach `!so @user --force` auslösen.
3. Prüfen: Der Shouti-Clip darf in der Sound-Queue warten.
4. Der offizielle Twitch-Shoutout darf erst nach sichtbarem Clip-Ende ausgelöst werden.
5. Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status" | ConvertTo-Json -Depth 10
```

Wichtige Felder:
- `state.displayQueue.soundSync.installed`
- `state.displayQueue.soundSync.lastResultReason`
- `state.displayQueue.soundSync.lastBundleId`
- `displayQueue.active`
- `officialQueue.history[0]`
