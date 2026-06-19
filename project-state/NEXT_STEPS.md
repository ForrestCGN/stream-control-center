# NEXT_STEPS – EVS52.27

Stand: 2026-06-19

## Direkt nach Einspielen testen

Nach dem Entpacken nach `D:\Git\stream-control-center`:

```powershell
.\stepdone.cmd "STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY"
```

Dann Status prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.93
moduleBuild   : STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY
```

## Test 1 – Winner-Overlay darf nicht automatisch starten

URL normal öffnen:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html
```

Erwartung:

- Overlay bleibt leer/versteckt.
- Kein altes Finale wird automatisch geladen.
- Kein Auto-Replay ohne explizites `?autoReplay=1`.

## Test 2 – Glücksrad darf Auswertung nicht mit einblenden

Glücksrad im Dashboard/OBS wie üblich starten oder anzeigen.

Erwartung:

- Glücksrad wird angezeigt.
- Gewinner-/Auswertungs-Overlay bleibt aus.
- Kein teilweises Einblenden des Winner-Overlays.

Wenn es trotzdem sichtbar wird:

- OBS-Szenenstruktur prüfen: Liegt die Winner-Overlay-Browserquelle in derselben gemeinsamen Overlay-Szene wie das Glücksrad?
- Browserquelle manuell neu laden und prüfen, ob sie weiterhin leer bleibt.
- Danach Bus-/Payload-Logs prüfen.

## Test 3 – Finale/Auswertung starten oder erneut abspielen

Für das fertige Testevent:

```powershell
$eventUid = "evs_event_mqkyu4hp_27b0cb030fad"
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/events/$eventUid/finale" | ConvertTo-Json -Depth 8
```

Erwartung:

- `ok:true`
- `dashboardCanStartFinale:true` oder bei bereits gestartetem Finale passende Replay-/Ende-Logik
- Ranking vorhanden

Dann über Dashboard starten oder per API:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/events/$eventUid/finale/start?confirm=1" `
  -ContentType "application/json" `
  -Body '{"actor":"dashboard"}' | ConvertTo-Json -Depth 8
```

Erwartung:

- `ok:true`
- Finale wird sichtbar.
- Top-3-Daten enthalten Avatar-Felder.

## Test 4 – RoxxyFoxxyCGN Avatar

Ein Finale/Test erzeugen oder erneut abspielen, bei dem `RoxxyFoxxyCGN` in den Top 3 ist.

Erwartung:

- Vor Anzeige wird der Top-3-Avatar über Twitch/Userinfo aufgelöst.
- RoxxyFoxxyCGN zeigt Avatar, sofern Twitch/Userinfo Avatar liefert.
- Nur wenn Twitch/Userinfo und lokale Fallbacks nichts liefern, werden Initialen/Fallback angezeigt.

## Test 5 – Finale-Ende und Replay

Nach sichtbarer Auswertung:

- Finale manuell beenden.
- Prüfen, ob Overlay verschwindet.
- Prüfen, ob Dashboard danach `Auswertung erneut abspielen` anbietet.
- Replay starten.
- Prüfen, ob dieselbe Auswertung erneut abgespielt wird und nicht neu ausgelost wird.

## Danach: Reveal-Video / Sound-Queue-Safety

Noch offen aus dem Notfallstand:

- Richtige Sound-Antwort wurde erkannt.
- Reveal-Video startete.
- Einmal blieb das Sound-System bei `Sound läuft` hängen.
- Kanalpunkte-Sounds liefen nach `/api/sound/skip` wieder weiter.

Zu prüfen:

- Was sendet `backend/modules/stream_events.js` beim Reveal-Video ans Sound-System?
- Kommen `mediaType=video`, `durationMs`, `eventUid`, `roundUid`, `requestId` sauber an?
- Gibt das Sound-System nach Video-Ende zuverlässig die Queue frei?
- Greift ein Fallback, falls `video-ended`/`audio-ended` ausbleibt?

Notfallbefehl bleibt vorerst:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/skip"
```

## Danach: Soundrotation / Zufall

Zu prüfen:

- offene Schnipsel werden zufällig gewählt
- gelöste Schnipsel werden entfernt/markiert
- ungelöste Schnipsel werden später neu eingereiht
- ungelöste Schnipsel kommen nicht direkt als nächstes, wenn Alternativen vorhanden sind
- `avoidImmediateRepeat` und `minRepeatDistance: 3` wirken korrekt
