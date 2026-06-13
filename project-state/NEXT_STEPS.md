# NEXT_STEPS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-24

## Direkt testen

1. Syntaxcheck:

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
```

2. StepDone:

```powershell
.\stepdone.cmd "EVS-24 Simple Active Event Runtime Gate"
```

3. API:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s.runtimeGate | ConvertTo-Json -Depth 6
```

4. Dashboard:

```text
Event-System → Status
```

## Nächster sinnvoller Block

Nach bestätigtem EVS-24-Test:

```text
EVS-24b – Completion Documentation
```

Danach erst entscheiden, ob als Nächstes Chatmeldungen kontrolliert vorbereitet/aktiviert werden oder ob zuerst Sound-/Text-Event-Bedienung vereinfacht wird.

## Harte Grenzen

- Keine Twitch-Ausgabe ohne späteren expliziten Go.
- Kein Sound-Playback ohne späteren expliziten Go.
- Keine Sound-System-Queue-Berührung.
