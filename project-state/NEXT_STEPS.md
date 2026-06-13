# NEXT_STEPS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-19 vorbereitet

## Sofort nächster Schritt

### EVS-19 Test – Sound/Text Parallel-UND-Runtime

Ziel:

```text
Prüfen, dass eine Chatnachricht bei aktivem Kombi-Event an Sound und Text geht.
Nicht ODER, sondern UND.
```

Pflicht vor Test:

```powershell
node -c .ackend\modules\stream_events.js
.\stepdone.cmd "EVS-19 Sound Text Parallel AND Runtime"
```

Testablauf:

```powershell
$e = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/chat-runtime/create-stealth-test-event?confirm=1" -Body (@{
  start = $true
} | ConvertTo-Json) -ContentType "application/json"

$n = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round" -Body (@{
  allowReuse = $true
} | ConvertTo-Json) -ContentType "application/json"

$t = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/chat-runtime/test-chat" -Body (@{
  userLogin = "forrestcgn"
  userDisplayName = "ForrestCGN"
  message = "heimleitung"
} | ConvertTo-Json) -ContentType "application/json"

$t | Select-Object ok,mode,soundSolved,textSolved,textWordHitCount,chatOutputCount,directSend,directPlayback,soundSystemQueueTouched
$t.sound | ConvertTo-Json -Depth 5
$t.text | ConvertTo-Json -Depth 5
```

Erwartung:

```text
mode = sound_text_parallel_and
Sound wird geprüft.
Text wird ebenfalls geprüft.
Wenn die Nachricht für beide passt, dürfen beide Runtimes Punkte/Ergebnisse buchen.
directSend = False
directPlayback = False
soundSystemQueueTouched = False
```

## Danach sinnvolle Schritte

### EVS-20 – Dashboard-Anzeige für Parallelstatus

- Im Dashboard klar anzeigen, ob Sound/Text parallel aktiv sind.
- Aktive Soundrunde und Textstatus streamerfreundlich darstellen.
- Debug-Antworten nur im API-/Dashboard-Testbereich.

### EVS-21 – ChatOutput Dispatcher Prep

- Prepared ChatOutputs aus Sound/Text gesammelt anzeigen.
- Später optional per Config senden.
- Kein scharfes Senden ohne Live-Schalter, Rechte und Warnung.

### EVS-22 – Sound-System Playback Integration Prep

- Prepared Playback an vorhandenes Sound-System anschließbar machen.
- Weiterhin geschützt per Config.
- Kein zweiter Player, keine unkontrollierte Queue-Berührung.

### EVS-23 – Event Overlay Prep

- Aktives Event, Modus, Soundrunde, Textstatus, Punkte/Ranking anzeigen.
- Keine überladene Show.

### EVS-24 – Event-Ende / Top 3 / Abschluss

- Event sauber beenden.
- Top 3 Ranking vorbereiten.
- Textvarianten für Abschluss nutzen.

## Offene Fachfragen

- Sollen Sound-Misses bei jedem Chat gezählt werden oder nur bei Nachrichten mit Mindestähnlichkeit?
- Soll eine kombinierte ChatOutput-Zusammenfassung gebaut werden, wenn Sound und Text gleichzeitig gelöst werden?
- Wie sollen Live-Schalter im Dashboard exakt heißen und wer darf sie aktivieren?
