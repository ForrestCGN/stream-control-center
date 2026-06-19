# TEST REPORT – EVS52.27 Winner Top3 Twitch Avatars / No AutoReplay

Stand: 2026-06-19

## Getesteter/zu testender Stand

```text
backend/modules/stream_events.js
moduleVersion: 0.5.93
moduleBuild: STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY

htdocs/overlays/stream_events/event_winner_overlay.html
moduleVersion: 0.5.42
STEP: EVS52.27
```

## Status

Dieser Testreport ist vorbereitet. Die Live-Tests müssen nach Einspielen der ZIP und `stepdone.cmd` durchgeführt werden.

## Test 1 – Statusroute

Befehl:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.93
moduleBuild   : STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY
```

Status: offen.

## Test 2 – Winner-Overlay normal öffnen

URL:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html
```

Erwartung:

- kein Auto-Replay
- kein altes Finale
- Overlay bleibt leer/versteckt

Status: offen.

## Test 3 – Glücksrad-Kollision

Aktion:

- Glücksrad im Dashboard/OBS starten oder anzeigen.

Erwartung:

- Glücksrad erscheint.
- Winner-/Auswertungs-Overlay bleibt aus.
- Kein teilweises Einblenden.

Status: offen.

## Test 4 – Finale/Auswertung

Aktion:

- Finale über Dashboard starten oder per API `/finale/start?confirm=1` auslösen.

Erwartung:

- Finale wird sichtbar.
- Ranking/Gewinner werden korrekt angezeigt.
- Top-3 enthalten Avatar-Daten.

Status: offen.

## Test 5 – RoxxyFoxxyCGN Avatar

Aktion:

- Finale/Test mit RoxxyFoxxyCGN in Top 3 ausführen oder vorhandenes geeignetes Finale erneut abspielen.

Erwartung:

- RoxxyFoxxyCGN bekommt Avatar, sofern Twitch/Userinfo Avatar liefert.
- Kein Fallback/Initialen, wenn Twitch/Userinfo Avatar liefern kann.

Status: offen.

## Test 6 – Finale Ende / Replay

Aktion:

- Finale manuell beenden.
- Replay/`Auswertung erneut abspielen` testen.

Erwartung:

- Overlay verschwindet nach Ende.
- Replay zeigt dieselbe Auswertung erneut.
- Keine Neuauslosung bei Replay.

Status: offen.

## Noch offen nach EVS52.27

- Reveal-Video/Sound-Queue-Safety prüfen.
- Random-Rotation/minRepeatDistance prüfen.
- `finaleActivity.active:true` bei `finaleStarted:false` später fachlich bereinigen.
