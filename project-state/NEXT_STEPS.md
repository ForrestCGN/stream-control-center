# NEXT_STEPS – stream-control-center

Stand: 2026-06-18 – EVS52.15

## Jetzt testen

EVS52.15 ist ein reiner Report-/Diagnose-Cleanup. Das Live-Verhalten von Chat, Sound, Satz, Punkten und Bot-Filter soll unveraendert bleiben.

### Version pruefen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.86
moduleBuild   : STEP_EVS52_15_REPORT_DIAG_CLEANUP
```

### Diagnose pruefen

Nach einem neutralen Teiltreffer und einer Satzloesung:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s.runtime.counters | Select-Object textWordHits,textWordHitChatOutputsBundled,textPhraseSolves,chatOutputsLiveSent | Format-List

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/text-runtime/report"
$r.phraseSolves | Select-Object userLogin,userDisplayName,phraseIndex,phraseNumber,points,pointsAwarded,createdAt | Format-Table -AutoSize
```

Erwartung:

- `textWordHitChatOutputsBundled` steigt, sobald eine neutrale Teiltreffer-Chatmeldung erzeugt wurde.
- `phraseSolves.points` zeigt die vergebenen Satzpunkte.
- Soundantworten, Satzteiltreffer, Satzloesung, Duplicate und Bot-Filter verhalten sich wie in EVS52.14.

## Naechste sinnvolle Steps

1. Bot-/Ignore-Liste in Dashboard-Einstellungen verschieben.
2. Teiltreffer-Textvarianten im Dashboard bearbeitbar machen/pruefen.
3. Satzloesungs-Overlay optisch nachjustieren.
4. Danach erneute Doku/Handoff nach stabilem Teststand.
