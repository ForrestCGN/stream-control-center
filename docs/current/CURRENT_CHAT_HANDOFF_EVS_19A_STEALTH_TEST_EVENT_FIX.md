# CURRENT CHAT HANDOFF – EVS-19a Stealth Test Event Fix

Stand: 2026-06-13

## Modulstand

```text
MODULE_VERSION = 0.5.7
MODULE_BUILD   = STEP_EVS_19A_STEALTH_TEST_EVENT_FIX
```

## Anlass

Beim Test von `POST /api/stream-events/chat-runtime/create-stealth-test-event?confirm=1` trat der Fehler auf:

```text
getTextPhrases is not defined
```

Der Fehler lag im neuen EVS-19-Stealth-Testevent-Response. Die Produktivregel fuer parallele Sound- und Textauswertung bleibt unveraendert.

## Änderung

- `getTextPhrases(event)` als lokalen Helper in `backend/modules/stream_events.js` ergänzt.
- Der Stealth-Testevent-Response kann Textphrasen jetzt sauber aus `event.textConfig.phrases` ausgeben.
- EVS-19 UND-Regel bleibt bestehen: Eine Chatnachricht wird bei aktivem Kombi-Event an Sound und Text gegeben.

## Nicht geändert

- Keine direkte Twitch-Chat-Ausgabe.
- Kein direktes Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Keine DB-Migration.
- Keine Dashboard-Logik.

## Tests

```powershell
node -c .\backend\modules\stream_events.js
.\stepdone.cmd "EVS-19a Stealth Test Event Fix"

$e = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/chat-runtime/create-stealth-test-event?confirm=1"
$e | Select-Object ok,eventUid,status
$e.phrases | Format-Table -AutoSize
```

Erwartung:

```text
ok = True
phrases sichtbar
kein Fehler getTextPhrases
```
