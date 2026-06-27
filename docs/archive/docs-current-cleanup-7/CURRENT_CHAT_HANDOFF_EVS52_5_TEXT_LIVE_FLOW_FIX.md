# CURRENT CHAT HANDOFF – EVS52.5 Text Live Flow Fix

Stand: 2026-06-18

## Ziel

Echte Twitch-Chatnachrichten kommen an, weil das Sound-Spiel funktioniert. Der Fehler lag im Satz-System: Dashboard/UI-Konfig nutzt Aliasfelder wie `hintTokensEnabled` und `showPartialCount`, waehrend die Text-Runtime bisher primaer `partialHintsEnabled` und `showPartialWordCount` gelesen hat. Dadurch konnten Teiltreffer bei echten Events uebersprungen werden, besonders wenn `wordPointsEnabled=false` war.

## Geändert

- `backend/modules/stream_events.js`
  - Version `0.5.76 / STEP_EVS52_5_TEXT_LIVE_FLOW_FIX`.
  - `getTextRuntimeConfig()` liest jetzt Aliasfelder:
    - `hintTokensEnabled` → Teiltreffer-Erkennung aktiv.
    - `showPartialCount` → Anzeige/Chat-Kontext fuer bekannte Treffer.
    - `uniqueWordsPerUser` → eindeutige Woerter pro User/Satz.
  - Worttreffer-Erkennung ist von Wortpunkten getrennt:
    - `wordPointsEnabled=false` = keine Punkte.
    - Teiltreffer und ChatOutput bleiben moeglich, wenn Hinweise aktiv sind.
  - Runtime-Gate meldet bei aktivem Online-Event `chatOutputLiveSend=true`.
  - `runtime.lastTextChatRuntime` fuer Diagnose ergaenzt.
  - Neue Route `GET /api/stream-events/text-runtime/live-debug`.
  - Neuer Teststep `text-live-flow-check`.

- `tools/tests/EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1`
  - Prueft Aliasfelder, Teiltreffer ohne Wortpunkte, Satzpunkte, Duplicate-Schutz und Ranking.
  - Sendet nicht live in Twitch.

## Nicht geändert

- Sound-Auswertung.
- Sound-Punkte.
- Satzloesungspunkte.
- Ranking-System.
- Celebration-Overlay bei Satzloesung.
- Dashboard-Testbereich-UI.
- Datenbankschema.

## Tests

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

.\tools\tests\EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1
```

Erwartung:

- `moduleVersion = 0.5.76`
- `moduleBuild = STEP_EVS52_5_TEXT_LIVE_FLOW_FIX`
- `checks.passed = true`
- Teilwort `Test` wird erkannt.
- Wortpunkte bleiben 0, wenn `wordPointsEnabled=false`.
- Kompletter Satz gibt 40 Punkte.

## Live-Test danach

Bei aktivem echten Event mit Satz `Die ist ein Satz Test` im Twitch-Chat schreiben:

```text
Test
```

Dann pruefen:

```powershell
$d = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/text-runtime/live-debug"
$d.lastTextChatRuntime | ConvertTo-Json -Depth 8
$d.report.counts | ConvertTo-Json -Depth 4
```

Erwartung:

- `textWordHitCount > 0`
- `chatOutputCount > 0`
- Chatmeldung wird ueber `helper_chat_output` gesendet.
