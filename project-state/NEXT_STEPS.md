# NEXT_STEPS – stream-control-center

Stand: 2026-06-18 – EVS52.14 getestet/stabil

## Aktueller stabiler Stand

EVS52.14 ist live getestet und gilt als funktionierender Stand für das kombinierte Event-System mit Sound + Satz/Text.

Aktiver Modulstand:

```text
stream_events moduleVersion : 0.5.85
stream_events moduleBuild   : STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS
```

Bestätigt:

- Twitch-Chat kommt über `twitch_events`/Communication-Bus bei `stream_events` an.
- Sound und Satz/Text werden über dieselbe normalisierte Chatmessage verarbeitet.
- Soundantworten funktionieren.
- Satz-Teiltreffer funktionieren.
- Satzlösung + Overlay + Punkte funktionieren.
- Duplicate wird erkannt.
- Bot-/Self-Loop ist gestoppt.
- Wartezeit überspringen funktioniert.
- Es läuft nur ein aktives Event.

## Nächster sinnvoller Step

### EVS52.15 – Diagnose-/Dashboard-Cleanup nach stabilem Chatfix

Ziel:

- Keine neue Fachlogik.
- Bestehenden stabilen EVS52.14-Stand nicht riskieren.
- Nur Diagnose/Dashboard-Konfigurationspunkte vorbereiten.

Vorschlag für EVS52.15:

1. `textWordHitChatOutputsBundled` prüfen und korrekt zählen lassen, wenn mehrere Satztreffer zu einer sichtbaren Chatmeldung zusammengefasst werden.
2. `phraseSolves.points` im Report prüfen und korrekt anzeigen.
3. Bot-/Systemaccount-Blockliste als spätere Dashboard-Einstellung planen, noch nicht blind umbauen.
4. Satzlösungs-Overlay-Layout kurz prüfen, weil Text rechts etwas knapp wirkt.

## Wichtige Tests vor jedem weiteren Umbau

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
$s.runtime.chatSource | Format-List
$s.runtime.activeEventGuard | Format-List
$s.runtime.counters | Select-Object twitchChatMessages,twitchChatSelfSkipped,textMessagesProcessed,soundChatMessagesProcessed,soundAnswerMatches,soundAnswerMisses,textWordHits,textWordHitChatOutputsBundled,textPhraseSolves,chatOutputsLiveRequested,chatOutputsLiveSent,eventCommandsHandled,soundWaitsSkipped | Format-List

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/text-runtime/report"
$r.counts | Format-List
$r.ranking.rows | Format-Table -AutoSize
$r.phraseSolves | Select-Object userLogin,userDisplayName,phraseIndex,points,createdAt | Format-Table -AutoSize
```

## Nicht direkt anfassen

- Keine DB ersetzen.
- Keine Chatquelle erneut umbauen.
- Keine Direct-/Wildcard-Hooks zurückholen.
- Keine Sound-/Satz-Punktelogik ändern, solange kein konkreter Fehler vorliegt.
- Keine Botliste direkt groß umbauen, bevor Dashboard-Konzept klar ist.
