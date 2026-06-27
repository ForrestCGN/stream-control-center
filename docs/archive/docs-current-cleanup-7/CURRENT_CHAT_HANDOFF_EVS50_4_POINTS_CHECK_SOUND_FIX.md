# CURRENT CHAT HANDOFF – EVS50.4 Points-Check Sound-Fix

Stand: 2026-06-18

## Ausgangslage

EVS50.3 hat den Insert-Fehler beim `points-check` behoben. Danach lief der Test, aber das Ergebnis zeigte:

```text
userLogin    : forrestcgn
totalPoints  : 30
soundPoints  : 0
phrasePoints : 30
wordPoints   : 0
```

Damit war sichtbar: Satz-/Text-Punkte wurden korrekt geschrieben, Sound-Punkte aber nicht.

## Ursache

Der synthetische Dashboard-Punktecheck erstellt ein kombiniertes Testevent. Die Sound-Testlösung sollte eine aktive Soundrunde erzeugen und dann per `resolveSoundRound()` lösen. Das Erzeugen der Soundrunde konnte aber am Runtime-Gate hängen bleiben, z. B. wenn der Stream-State offline ist. Der Testflow gab danach trotzdem weiter ein Ergebnis aus, wodurch nur die Satzpunkte sichtbar waren.

## Änderung

Backend `stream_events.js`:

- Modulversion erhöht auf `0.5.65`.
- Build erhöht auf `STEP_EVS50_4_POINTS_CHECK_SOUND_FIX`.
- `createSoundRound()` darf das Runtime-Gate nur für echte Dashboard-Testevents umgehen.
- Die Umgehung gilt nur bei:
  - `event.metadata.dashboardTest === true`, oder
  - `event.metadata.testEvent === true`, oder
  - expliziten Testoptionen `dashboardTest/testMode/allowOfflineTest/ignoreRuntimeGate`.
- Produktive Soundrunden bleiben unverändert durch das Runtime-Gate geschützt.
- `runEventTestSoundCorrect()` ruft `createSoundRound()` jetzt mit `dashboardTest: true` und `allowOfflineTest: true` auf.
- `runEventTestPointsCheck()` gibt nur noch `ok: true` zurück, wenn:
  - Sound-Testlösung erfolgreich war,
  - mindestens 20 Sound-Punkte geschrieben wurden,
  - mindestens 30 Satz-/Text-Punkte geschrieben wurden,
  - die Gesamtpunkte mindestens 50 betragen.

## Nicht geändert

- Keine produktive DB ersetzt.
- Keine Loyalty-Punkte berührt.
- Keine Winner-Finale-Logik geändert.
- Keine Sound-System-Playback-Logik geändert.
- Keine Overlay-Logik geändert.
- Keine Dashboard-Datei geändert.

## Nach dem Einspielen

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "EVS50.4 Points-Check Sound-Fix"
```

Server/Backend neu starten oder Modul reloaden.

## Tests

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.65
moduleBuild   : STEP_EVS50_4_POINTS_CHECK_SOUND_FIX
```

Punktecheck:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/test/run?confirm=1&step=points-check" -Method Post -Body (@{} | ConvertTo-Json) -ContentType "application/json"

$r.ok
$r.checks | ConvertTo-Json -Depth 6
$r.userStats.user | Select-Object userLogin,totalPoints,soundPoints,phrasePoints,wordPoints | Format-List
$r.ranking.rows | Select-Object rank,userLogin,points | Format-Table -AutoSize
```

Erwartung:

```text
$r.ok = True
soundPoints >= 20
phrasePoints >= 30
totalPoints >= 50
Ranking Platz 1 ForrestCGN >= 50 Punkte
```

Danach Dashboard prüfen:

```text
Event-System → Aktuelles Event → ForrestCGN anklicken
```

Das Punktefenster muss Sound- und Satzpunkte getrennt und den Punkteverlauf sichtbar anzeigen.

## Nächster Schritt

Wenn EVS50.4 sauber getestet ist:

EVS50.5 – Satz-System Einzeltests im Dashboard:

- Satz-Testevent starten
- falsche Antwort einzeln testen
- richtige Antwort einzeln testen
- doppelte Lösung prüfen
- Text-Report anzeigen
- Runtime-Parts für Text/Sound/Gesamt sichtbar machen
