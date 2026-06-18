# NEXT_STEPS – stream-control-center

Stand: 2026-06-18 – EVS52.9

## Sofort nächster Schritt im neuen Chat

### EVS52.9 – echte Chatquelle finden und zentral für Sound + Satz nutzen

Nicht weiter coden, bevor die echte Chatquelle gefunden ist.

#### Ziel

Eine zentrale normalisierte Chat-Verarbeitung:

```text
Twitch-Chat
→ Normalisierung + Dedupe
→ Sound-Teilspiel prüft Antwort
→ Satz-Teilspiel prüft Worttreffer/Satzlösung
→ gemeinsame Event-Punktewertung
```

#### Zuerst prüfen

```text
backend/modules/stream_events.js
backend/modules/twitch_events.js
backend/modules/twitch_presence.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
```

Wenn Soundantworten in einer anderen Datei verarbeitet werden, diese Datei anfordern/prüfen.

#### Auswertung der Diagnose berücksichtigen

- `stream_events:twitch.chat.message` hatte `delivered=0`.
- Andere spezifische `twitch.chat/message` Subscriber hatten ebenfalls `delivered=0`.
- `twitch_events.eventSubChat.notifications=0` und `chatMessagesEmitted=0`.
- Wildcard-Bus-Fallback liefert allgemeine Bus-Events, ist aber kein Beweis für echte Chatmessages.

#### Nicht tun

- Keine weiteren Direct-Hooks blind hinzufügen.
- Nicht Sound-Flow umbauen, ohne echte Stelle verstanden zu haben.
- Nicht EVS52.6–EVS52.8 als finale Architektur betrachten.

## Pflicht nach jedem Fix

```powershell
node -c .\backend\modules\stream_events.js
node -c .\backend\modules\twitch_events.js
node -c .\backend\modules\twitch_presence.js
node -c .\htdocs\dashboard\modules\stream_events.js
```

Dann:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\tests\EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1
```

Live testen:

1. Teilwort aus offenem Satz.
2. Kompletter Satz.
3. Duplicate.
4. Soundantwort.
5. Ranking/User-Historie.
6. `helper_chat_output` Status.

## Abschlusskriterium

EVS52.9 ist erst abgeschlossen, wenn:

- Sound-Spiel weiterhin funktioniert.
- Satz-Spiel echte Twitch-Chatmessages erkennt.
- Worttreffer ohne Wortpunkte eine Chatmeldung senden.
- Satzlösung Punkte + Chatmeldung + 15s Overlay auslöst.
- Ranking Sound+Satz korrekt addiert.
- Keine unnötigen doppelten Chatpfade aktiv bleiben.


## EVS52.9 nach Einspielen

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. StepDone ausfuehren:

```powershell
.\stepdone.cmd "EVS52.9 Twitch-Events Chatquelle fuer Sound und Satz"
```

3. Backend neu starten.
4. Syntax-/Smoke-Checks ausfuehren:

```powershell
node -c .\backend\modules\stream_events.js
node -c .\backend\modules\twitch_events.js
node -c .\backend\modules\twitch_presence.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
$s.runtime.chatSource | Format-List

$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$t.eventSubChat | Format-List

powershell -ExecutionPolicy Bypass -File .\tools\tests\EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1
```

5. Live-Test mit echtem Twitch-Chat:
   - Teilwort aus offenem Satz.
   - kompletter Satz.
   - Duplicate.
   - Soundantwort.
   - Ranking/User-Historie.

## EVS52.10 – direkt nach Einspielen

1. Backend neu starten.
2. `stepdone.cmd` ausführen.
3. Prüfen, ob `twitch_presence` automatisch verbunden und dem Channel beigetreten ist.
4. Eine echte Twitch-Chatnachricht senden.
5. Prüfen, ob `twitch_presence.chatBus.emitCount` und `stream_events.runtime.chatSource.delivered` steigen.
6. Danach erst Sound+Satz-Live-Test fortsetzen.

Wenn `twitch_presence.autostart.result=failed`, zuerst den Fehler aus `twitch_presence.autostart.error` prüfen. Nicht wieder Direct-Hooks stapeln.
