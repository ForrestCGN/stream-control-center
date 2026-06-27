# CURRENT CHAT HANDOFF – EVS52.15 Report-/Diagnose-Cleanup

Stand: 2026-06-18

## Ausgangslage

EVS52.14 wurde live getestet und gilt funktional als stabil:

- Twitch-Chat kommt ueber Twitch-Events/Communication-Bus bei `stream_events` an.
- Sound + Satz nutzen dieselbe Chatquelle.
- Soundantworten funktionieren.
- Satz-Teiltreffer funktionieren mit neutralen Meldungen ohne Satznummer.
- Satzloesung, Overlay und Duplicate funktionieren.
- Bot-/Self-Filter funktioniert.
- Skip-Wait funktioniert.

## EVS52.15

### Modulstand

```text
stream_events 0.5.86 / STEP_EVS52_15_REPORT_DIAG_CLEANUP
```

### Geaendert

- `runtime.counters.textWordHitChatOutputsBundled` wird jetzt bei jeder erzeugten neutralen/gebuendelten Teiltreffer-Chatmeldung hochgezaehlt.
- `text-runtime/report.phraseSolves[]` enthaelt jetzt zusaetzlich `points`, damit PowerShell-Abfragen mit `Select-Object ... points` die Satzpunkte anzeigen.

### Nicht geaendert

- Keine Chatquelle geaendert.
- Keine Soundlogik geaendert.
- Keine Satz-/Trefferlogik geaendert.
- Keine Punktevergabe geaendert.
- Keine DB-Struktur geaendert.
- Keine Dashboard-UI geaendert.

## Test nach Deploy

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
$s.runtime.counters | Select-Object textWordHits,textWordHitChatOutputsBundled,textPhraseSolves,chatOutputsLiveSent | Format-List

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/text-runtime/report"
$r.phraseSolves | Select-Object userLogin,userDisplayName,phraseIndex,phraseNumber,points,pointsAwarded,createdAt | Format-Table -AutoSize
```

## Naechste offene Punkte

1. Bot-/Ignore-Liste in Dashboard-Einstellungen verschieben.
2. Textvarianten im Dashboard bearbeiten/pruefen.
3. Satzloesungs-Overlay optisch nachjustieren.
4. Nach stabilem Test Doku/Handoff aktualisieren.
