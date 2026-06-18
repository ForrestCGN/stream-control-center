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


## Nach EVS51.6

1. Laufendes Event starten oder Sound-Status neu laden.
2. Prüfen, ob Sound-Steuerung automatisch einen nächsten Schnipsel plant.
3. Danach Runtime-Overlay für Satz-/Soundstatus verbessern.

## Nach EVS52.3

1. Satz im laufenden Event lösen.
2. Runtime-Overlay prüfen: 15 Sekunden Celebration mit User, Satz, Punkte.
3. Prüfen, dass Worttreffer kein Overlay auslösen.
4. Textvarianten im Event-System-Texte-Bereich prüfen.


## Nach EVS52.4

1. `stepdone.cmd` ausführen und Server neu starten/reloaden.
2. `Event-System → Texte` öffnen und neue Keys prüfen:
   - `text.word_hit.chat`
   - `text.phrase.solved`
   - `text.phrase.duplicate.chat`
   - `text.phrase.solved.overlay`
3. Live im Chat testen:
   - Teilwort aus offenem Satz → eine Chatmeldung.
   - kompletter Satz → Chatmeldung + 15s Overlay.
   - derselbe Satz erneut → Duplicate-Meldung, keine Punkte.
4. Falls nichts im Chat kommt:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/chat-output/status" | ConvertTo-Json -Depth 8
```

## Nach EVS52.5

1. EVS52.5 im echten Chat testen: Teilwort, kompletter Satz, doppelte Loesung.
2. Wenn Live-Chatmeldung nicht rausgeht: `GET /api/stream-events/text-runtime/live-debug` und `/api/chat-output/status` vergleichen.
3. Danach Dashboard-Texte-Bereich pruefen: Satz-Spiel-Keys editierbar und zufaellige Varianten sichtbar.
4. Danach optional: Satzloesungs-Overlay visuell verfeinern.

## Nach EVS52.6

1. Live-Test mit echtem Wort aus offenem Satz im Twitch-Chat.
2. Prüfen: `/api/stream-events/text-runtime/live-debug` zeigt echte Chatverarbeitung.
3. Prüfen: `/api/chat-output/status` zeigt gesendete Satz-Spiel-Meldung.
4. Danach ggf. UI/Overlay-Feinschliff für Satzlösung-Celebration.

## Nach EVS52.7

1. Echten Twitch-Chat mit Teilwort aus offenem Satz testen.
2. Prüfen, ob `directChatBridge.delivered` steigt.
3. Prüfen, ob Worttreffer/ChatOutput und Bot-Chatmeldung erscheinen.
4. Danach Satzlösung testen: Punkte + Overlay + Chatmeldung.
