# CURRENT CHAT HANDOFF – EVS51.3 Satz-Testbereich UI-Cleanup

Stand: 2026-06-18

## Ergebnis

EVS51.3 räumt den Dashboard-Testbereich für das Satz-/Text-System auf.

## Geändert

- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`
- `backend/modules/stream_events.js` liegt unverändert aus EVS51.2 bei, damit der ZIP-Stand vollständig bleibt.
- Doku/Projektstand aktualisiert.

## Dashboard

Bereich:

```text
Event-System → Test → Satz-System gezielt testen
```

Nach `Satz-Check komplett` wird jetzt eine lesbare Satz-System-Prüfung angezeigt:

- Status-Karten für falsche Antwort, Worttreffer, Satzlösung, Duplikat-Schutz, Text-Abschluss, Kombi-Regel, Sound-Abschluss und Event-Finish
- getrennte Statuskarten „Nach Textlösung“ und „Nach Soundlösung“
- gelöste Sätze
- Worttreffer
- Ranking
- klickbare Ranking-Zeilen für User-Historie
- User-Historie-Buttons für ForrestCGN, EngelCGN, SatzPartial und Testuser

## Versionen

Backend:

```text
0.5.68 / STEP_EVS51_2_TEXT_CHECK_WRONG_FIX
```

Dashboard:

```text
0.5.50 / STEP_EVS51_3_TEXT_TEST_UI_CLEANUP
```

## Tests

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/test/run?confirm=1&step=text-check" -Method Post -Body (@{} | ConvertTo-Json) -ContentType "application/json"
$r.ok
$r.checks | ConvertTo-Json -Depth 6
$r.ranking.rows | Select-Object rank,userLogin,userDisplayName,points,entries | Format-Table -AutoSize
```

Dashboard-Test:

```text
Event-System → Test → Satz-Check komplett
```

Erwartung:

- Prüfung grün/bestanden
- keine normale Rohdatenwüste
- Ranking sichtbar
- User-Historie aus Ranking oder Buttons öffnet korrekt

## Nächster sinnvoller Schritt

EVS51.4: Satz-Rotation/Runtime-Overlay genauer prüfen und anzeigen: welcher Satz ist offen/gelöst, was passiert nach gelöst/ungelöst, und wie wird der Satz-Status im Overlay streamerfreundlich dargestellt.
