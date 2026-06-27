# CURRENT_CHAT_HANDOFF – EVS-19b Parallel Test Event Activation Fix

Stand: 2026-06-13

## Ergebnis

EVS-19b behebt zwei Test-/Report-Probleme aus EVS-19a:

- `chat-runtime/create-stealth-test-event` startet das neue Kombi-Testevent standardmäßig.
- Falls noch ein altes Test-/Stealth-Event aktiv ist, wird es als `finished` archiviert, nicht gelöscht.
- Produktive/unbekannte aktive Events werden nicht automatisch beendet.
- `chat-runtime/test-chat` kann optional `eventUid` erhalten.
- `text-runtime/report` wirft nicht mehr `rounds is not defined`.

## Unverändert

- Sound/Text UND-Regel bleibt aktiv.
- Keine direkte Twitch-Chat-Ausgabe.
- Kein direktes Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Keine DB-Migration.

## Test nach StepDone

```powershell
$e = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/chat-runtime/create-stealth-test-event?confirm=1"
$e | Select-Object ok,eventUid
$e.activeEvent | Select-Object eventUid,status,soundEnabled,textEnabled

$n = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round" -Body (@{ allowReuse = $true } | ConvertTo-Json) -ContentType "application/json"
$n.round | Select-Object roundUid,status,itemUid

$t = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/chat-runtime/test-chat" -Body (@{ userLogin="forrestcgn"; userDisplayName="ForrestCGN"; message="die heimleitung sucht den schluessel" } | ConvertTo-Json) -ContentType "application/json"
$t | ConvertTo-Json -Depth 8

$tr = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/text-runtime/report"
$tr.counts
```
