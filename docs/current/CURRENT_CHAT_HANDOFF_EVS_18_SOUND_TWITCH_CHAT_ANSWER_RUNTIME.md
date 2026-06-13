# CURRENT CHAT HANDOFF – EVS-18 Sound Twitch Chat Answer Runtime

Stand: 2026-06-13
Modul: `stream_events`
Step: `EVS-18 – Sound Twitch Chat Answer Runtime`

## Version

- `MODULE_VERSION = 0.5.5`
- `MODULE_BUILD = STEP_EVS_18_SOUND_TWITCH_CHAT_ANSWER_RUNTIME`

## Geänderte Datei

- `backend/modules/stream_events.js`

## Inhalt des Steps

EVS-18 finalisiert die vorbereitete Sound-Chat-Runtime für echte `twitch.chat.message` Bus-Events.

Umgesetzt:

- `handleTwitchChatEnvelope(...)` verarbeitet aktive Sound- und Text-Runtimes koexistenzsicher.
- Bei aktiver Soundrunde wird zuerst Sound geprüft.
- Eine korrekte Soundantwort löst die Soundrunde, bucht Punkte und gibt prepared-only `sound.solved` zurück.
- Nach korrekter Soundlösung wird Text nicht zusätzlich mit derselben Nachricht geprüft, damit keine Doppelwertung entsteht.
- Falsche Soundantworten erzeugen keine direkte Chat-Ausgabe und können danach bei aktivem Text-Spiel normal vom Text-Runtime-Teil geprüft werden.
- Die Subscription auf `twitch.chat`/`message` filtert nicht mehr hart auf `sourceModule: twitch_events`, damit Bus-Events aus `twitch_presence` ebenfalls ankommen können.
- Subscription-Meta wurde auf `purpose: stream_events_chat_runtime` geändert.

## Bewusst nicht geändert

- Keine direkte Twitch-Chat-Ausgabe.
- Kein direktes Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Kein neuer Bus.
- Kein zweiter Soundplayer.
- Keine neue Parallelstruktur.
- Keine DB-Migration.
- Keine Dashboard-Produktivaktionen.
- Debug Accepted Answers bleiben nur Dashboard/API-Test und nicht Overlay/Twitch-Chat.

## Wichtig vor Live-Test

Vor Live-/Systemtest zuerst im lokalen Repo ausführen:

```powershell
.\stepdone.cmd "EVS-18 Sound Twitch Chat Answer Runtime"
```

Erst danach Live/API-Test ausführen.

## Empfohlene Tests nach StepDone

```powershell
node -c .\backend\modules\stream_events.js
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,lastError
```

```powershell
$b = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/bus-status"
$b | Select-Object ok,module,moduleVersion,moduleBuild,subscriptionCount,lastError
```

Dann erst Sound-Testevent/aktive Runde und echte Chat-Bus-Tests prüfen.

## Nächster sinnvoller Schritt

Nach bestätigtem EVS-18-Test:

- EVS-19 planen: Sound-Runden-Timer/Unresolved-Automatik oder Dashboard-Anzeige für Bus-Runtime-Ergebnisse.
- Noch kein direkter Chat-Send und kein direktes Playback ohne separate Freigabe.
