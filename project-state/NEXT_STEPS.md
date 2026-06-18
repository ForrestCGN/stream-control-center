# NEXT STEPS – stream-control-center

## Nach EVS51.5

- Satz-Rotation im echten Runtime-Ablauf prüfen: gelöste Sätze raus, offene Sätze bleiben.
- Runtime-Overlay für Satzstatus verbessern.
- Kombinierte Events im Overlay prüfen: Sound fertig/Text offen und Text fertig/Sound offen.
- Dashboard für Satz-Runtime weiter ausbauen: offene/gelöste Sätze, letzte Antworten, nächste Aktion.

## Nächster Schritt nach EVS51.4

EVS51.5 – Runtime-Overlay für Satzstatus prüfen/verbessern.

- aktueller Satzstatus im Overlay
- gelöste/offene Sätze
- Antwortfenster/Hinweise
- Kombi-Anzeige Sound + Text

# NEXT_STEPS – stream-control-center

Stand: 2026-06-18 – nach EVS51.3

## Sofort nach Einspielen testen

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung Backend:

```text
moduleVersion : 0.5.68
moduleBuild   : STEP_EVS51_2_TEXT_CHECK_WRONG_FIX
```

Dashboard-Version im Browser/Testbereich:

```text
0.5.50 / STEP_EVS51_3_TEXT_TEST_UI_CLEANUP
```

## Backend-Test

```powershell
Remove-Variable r -ErrorAction SilentlyContinue
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/test/run?confirm=1&step=text-check" -Method Post -Body (@{} | ConvertTo-Json) -ContentType "application/json"
$r.ok
$r.checks | ConvertTo-Json -Depth 6
$r.ranking.rows | Select-Object rank,userLogin,userDisplayName,points,entries | Format-Table -AutoSize
```

Erwartung:

```text
$r.ok = True
passed = True
ForrestCGN 35 Punkte
EngelCGN 15 Punkte
SatzPartial 2 Punkte
```

## Dashboard-Test

```text
Event-System → Test → Satz-Check komplett
```

Erwartung:

- strukturierte Satz-System-Prüfung
- keine normale Rohdatenwüste
- Ranking sichtbar
- User-Historie per Ranking oder Button öffnet korrekt

## Nächster technischer Block

EVS51.4 – Satz-Rotation / Runtime-Overlay:

- prüfen, ob gelöste Sätze aus der Rotation entfernt bleiben
- offene Sätze bleiben offen/erneut spielbar
- Text-Teilspielstatus im Runtime-Overlay verständlich anzeigen
- Kombi-Status Sound/Text im Overlay prüfen
