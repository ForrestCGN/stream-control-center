# CURRENT CHAT HANDOFF – EVS-11b Text Chat Output Test Visibility

Stand: 2026-06-13

## Zweck

EVS-11b macht die in EVS-11 vorbereiteten Chat-Ausgaben direkt in den Test-Responses sichtbar.
Dadurch kann die Text-Spiel-Runtime getestet werden, ohne direkt in den Twitch-Chat zu senden.

## Änderungen

- `backend/modules/stream_events.js`
  - Modul-Version auf `0.4.3` gesetzt.
  - Build auf `STEP_EVS_11B_TEXT_CHAT_OUTPUT_TEST_VISIBILITY` gesetzt.
  - Satzlösungen geben jetzt zusätzlich `chatOutput` im Ergebnis zurück.
  - `processTextChatMessage` sammelt vorbereitete Ausgaben in `chatOutputs`.
  - Worttreffer-Ausgaben und Wortpunkte-Ausgaben werden in `chatOutputs` sichtbar.
  - Test-Chat-Route zeigt dadurch `chatOutputs` und `chatOutputCount` direkt an.

## Wichtig

- Es wird weiterhin nichts direkt in den Twitch-Chat gesendet.
- Die Ausgaben sind nur vorbereitete Payloads.
- Bestehende EventBus-Ausgaben bleiben erhalten.
- Keine DB-Änderung.
- Keine Dashboard-Änderung.
- Keine Sound-/Overlay-Runtime.

## Test

```powershell
node -c .\backend\modules\stream_events.js
.\stepdone.cmd "EVS-11b Text Chat Output Test Visibility"
```

Danach mit aktivem Testevent:

```powershell
Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"user":"testuser","message":"Party"}' http://127.0.0.1:8080/api/stream-events/text-runtime/test-chat
```

Erwartung:

- `chatOutputs` ist vorhanden.
- `chatOutputCount` ist groesser als 0, wenn eine Meldung vorbereitet wurde.
- `directSend` bleibt `false`.
