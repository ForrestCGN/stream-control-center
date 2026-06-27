# CURRENT CHAT HANDOFF – EVS50.2 Punkte-Check Sound + Satz

Stand: 2026-06-18

## Ziel

Das Event-System wurde im Dashboard-Testbereich erweitert, damit Punktevergabe für Sound und Satz/Text gezielt geprüft werden kann.

## Geänderte Dateien

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS50_2_POINTS_CHECK.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Backend

Version:

```text
stream_events 0.5.63
STEP_EVS50_2_POINTS_CHECK_TESTS
```

Neue interne Testfunktionen:

```text
runEventTestSoundCorrect(eventUid, body)
runEventTestPointsCheck(body)
```

Erweiterte Route:

```text
POST /api/stream-events/test/run?confirm=1&step=sound-correct
POST /api/stream-events/test/run?confirm=1&step=points-check
```

## Dashboard

Version:

```text
stream_events 0.5.47
STEP_EVS50_2_POINTS_CHECK_TESTS
```

Im Tab `Test` gibt es neue Buttons:

```text
Sound richtig + Punkte
Punkte-Check Sound + Satz
```

Nach einem Test erscheint eine Punkte-Prüfung mit Gesamtpunkten, Sound-Punkten, Satz-/Text-Punkten, Ranking-Topwert, Teilspielstatus und kurzer User-Timeline.

## Wichtiges Verhalten

- Sound-Punkte und Satz-/Text-Punkte werden gemeinsam im Event-Ranking addiert.
- Die Trennung bleibt über `source_type` sichtbar.
- Userdetails im Tab `Aktuelles Event` zeigen weiterhin den kompletten Punkteverlauf.
- `points-check` erstellt ein frisches Testevent, startet es, simuliert falsche Antworten, löst Sound und zwei Sätze und liefert Ranking/User-Stats zurück.
- Wortpunkte können zusätzlich entstehen, wenn Text-Wortpunkte aktiv sind.

## Nach dem Einspielen

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "EVS50.2 Punkte-Check Sound und Satz"
```

## Tests

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/test/run?confirm=1&step=points-check" -Method Post -Body (@{} | ConvertTo-Json) -ContentType "application/json"
$r.userStats.user | Select-Object userLogin,totalPoints,soundPoints,phrasePoints,wordPoints | Format-List
$r.ranking.rows | Select-Object rank,userLogin,points | Format-Table -AutoSize
```

Dashboard:

```text
Event-System → Test → Punkte-Check Sound + Satz
Event-System → Aktuelles Event → ForrestCGN in Rangliste anklicken
```

## Nächster sinnvoller Schritt

EVS50.3: Satz-System selbst weiter härten:

- Satz-Testevent gezielter als eigener Bereich statt allgemeiner Testflow
- falsche Antwort / Worttreffer / Satzlösung separat anzeigen
- doppelte Lösung prüfen
- Text-Teilspielabschluss gegen Runtime-Parts prüfen
- Runtime-Overlay Satzstatus verbessern
