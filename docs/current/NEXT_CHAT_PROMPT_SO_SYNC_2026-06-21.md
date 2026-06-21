# NEXT CHAT PROMPT – SO Sync finaler Live-Check

Wir arbeiten am Repo `ForrestCGN/stream-control-center`, Branch `dev`, Live-Ziel `D:\Streaming\stramAssets`.

Aktueller bestätigter Stand:

- `clip_shoutout` läuft auf `0.2.51`.
- STEP: `STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX`.
- Der SoundSync-Listener ist installiert und empfängt Sound-Bus-Events.
- Finaler Offline-/Grace-Test `so_sync_final_test_20260621_124845.txt` hat bestätigt:
  - Clip-Shoutout läuft über Sound-System/Overlay.
  - Sound-System meldet `client_audio_ended`.
  - DisplayQueue wird danach auf `done` gesetzt.
  - OfficialQueue wird erst nach Clip-Ende befüllt.
  - Kein zu frühes offizielles Twitch-SO mehr.

Wichtig:

- Der letzte Test war nicht als echter Live-Twitch-Send final beweisbar, weil der Stream-State offline/grace war.
- Beim nächsten echten Stream soll nur noch geprüft werden, ob `officialStatus=sent` nach Twitch-Cooldown sauber erscheint.
- Keine Timer-Freigabe zurückbauen.
- Sound-System bleibt Playback-/Queue-Owner.
- Keine Funktionalität entfernen.
- Wenn Dateien fehlen: exakt nach den benötigten Dateien fragen, nicht raten.
- Bei neuen ZIP-/Code-Steps: echte Zielpfade ab Repo-Root, dann StepDone nach Einspielen/Deployen, erst danach testen.

Prüfkommandos:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status" |
  Select-Object moduleVersion,moduleBuild

Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue" |
  ConvertTo-Json -Depth 12

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=10" |
  ConvertTo-Json -Depth 12
```

Erwartung im echten Live-Test:

```text
Clip läuft über Sound-System/Overlay.
OfficialQueue wird erst nach Clip-Ende befüllt.
Nach Twitch-Cooldown: officialStatus=sent / result=sent.
```
