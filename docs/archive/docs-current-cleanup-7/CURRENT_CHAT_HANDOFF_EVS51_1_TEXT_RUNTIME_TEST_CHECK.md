# CURRENT CHAT HANDOFF – EVS51.1 Satz-System Testbereich

Stand: 2026-06-18

## Fertig

- EVS50.6 Punkte-Historie im Testbereich bestätigt.
- EVS51.1 Satz-System Testbereich gebaut.
- Backend-Teststeps für Satz-System ergänzt:
  - `text-check`
  - `text-create`
  - `text-wrong`
  - `text-word`
  - `text-correct`
  - `text-duplicate`
  - `text-report`
- Dashboard-Tab `Event-System → Test` hat jetzt einen eigenen Bereich `Satz-System gezielt testen`.
- `text-check` prüft:
  - falsche Antwort ohne Punkte
  - Worttreffer
  - zwei Satzlösungen
  - doppelte Lösung wird blockiert
  - Text-Teilspiel wird abgeschlossen
  - Gesamt-Event bleibt nach Text offen, solange Sound offen ist
  - Gesamt-Event wird nach Sound-Abschluss fertig
- Bugfix: alte Dashboard-Tests `wrong` und `correct` verwenden jetzt die konkrete Test-`eventUid`, nicht blind das aktive Event.
- Bugfix: `/api/stream-events/text-runtime/test-chat` akzeptiert jetzt `eventUid`/`event_uid`.

## Nicht geändert

- Keine produktive DB ersetzt.
- Kein DB-Schema geändert.
- Keine produktiven Events werden durch Satz-Tests beendet.
- Sound-System bleibt Playback-/Queue-Owner.
- Keine Twitch-Ausgabe aktiviert.

## Test nach Einspielen

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/test/run?confirm=1&step=text-check" -Method Post -Body (@{} | ConvertTo-Json) -ContentType "application/json"
$r.ok
$r.checks | ConvertTo-Json -Depth 6
$r.ranking.rows | Select-Object rank,userLogin,userDisplayName,points,entries | Format-Table -AutoSize
```

Erwartung:

```text
moduleVersion : 0.5.67
moduleBuild   : STEP_EVS51_1_TEXT_RUNTIME_TEST_CHECK
$r.ok = True
wrongNoPoints = True
wordHitWritten = True
phraseSolvesWritten = True
duplicatesBlocked = True
textCompletedAfterText = True
totalStillOpenAfterText = True
eventFinishedAfterSound = True
```

Dashboard-Test:

```text
Event-System → Test → Satz-Check komplett
```

Danach muss die Satz-System-Prüfung sichtbar sein.
