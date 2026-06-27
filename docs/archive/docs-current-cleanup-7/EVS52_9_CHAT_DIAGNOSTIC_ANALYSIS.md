# EVS52.9 – Diagnose-Auswertung: Chatquelle / Sound + Satz-System

Stand: 2026-06-18
Quelle: Auswertung der hochgeladenen PowerShell-Ausgaben zu `/api/communication/status` und `/api/twitch/events/status`.

## Kurzfazit

Der aktuelle Fehler liegt nicht mehr bei Punktelogik, Textvarianten, Overlay oder `helper_chat_output`.

Bestätigt ist:

- `stream_events` ist geladen und am Communication-Bus registriert.
- `stream_events` deklariert `consumes:twitch.chat.message`.
- Der Event-Catalog kennt `twitch.chat.message` als `channel=twitch.chat`, `action=message`.
- `helper_chat_output` ist grundsätzlich bereit.
- Die Satz-/Text-Testlogik funktioniert über Backend-/Dashboard-Tests.
- Punkte für Satzlösung werden korrekt gezählt; Worttreffer können ohne Wortpunkte erkannt werden.

Nicht bestätigt ist:

- Echte Twitch-Chatnachrichten kommen aktuell nicht als `twitch.chat.message` beim `stream_events`-Subscriber an.
- In der Diagnose wurden keine echten `twitch.chat.message` Bus-Events in den recent events sichtbar.
- Der spezifische `stream_events:twitch.chat.message` Subscriber hat `delivered=0`.
- `twitch_events.eventSubChat.counters.notifications=0` und `chatMessagesEmitted=0`.

Damit ist der nächste Schritt: **echte Chatquelle sauber finden und zentral anbinden**, nicht weitere Direct-Hooks stapeln.

## Wichtige Diagnosepunkte

### Communication-Bus

- `communication_bus` läuft: `ok=true`, `moduleVersion=0.8.4`.
- `stream_events` ist als Modul registriert: `version=0.5.79`, Build `STEP_EVS52_8_TWITCH_CHAT_BUS_FALLBACK`.
- `stream_events` meldet Capabilities inklusive:
  - `consumes:twitch.chat.message`
  - `publishes:stream_events.text.word_found`
  - `publishes:stream_events.text.phrase_solved`
  - `publishes:stream_events.sound.solved`

### Chat-Subscriptions im Bus

Folgende Subscriber auf `twitch.chat/message` sind sichtbar:

- `clip_shoutout:twitch.chat:message:auto_shoutout`
- `commands:twitch.chat:message`
- `loyalty_giveaways:twitch.chat:message:claim_runtime`
- `stream_events:twitch.chat.message`

Auffällig: Für diese spezifischen Chat-Subscriber steht in der Diagnose `delivered=0`. Das spricht dafür, dass im untersuchten Zeitraum **kein `twitch.chat/message` Bus-Event emittiert wurde** oder es nicht über diese Bus-Route läuft.

### EVS52.8 Wildcard-Fallback

`stream_events:twitch.chat.message.fallback` hat viele Deliveries, aber das ist ein leerer Channel/Action-Wildcard und bekommt auch Heartbeats/Status-Events. Das ist **kein Beweis**, dass echte Chat-Events angekommen sind. Es zeigt nur, dass der Wildcard grundsätzlich Bus-Events sieht.

### Twitch Events / EventSub Chat

`twitch_events` zeigt:

- `eventSubChat.enabled=true`
- `eventSubChat.active=true`
- WebSocket `OPEN`
- Subscription `channel.chat.message` ist `enabled`
- `notifications=0`
- `chatMessagesEmitted=0`

Damit kam über EventSub-Chat in der Diagnose **keine Chatnachricht als Event** durch.

### Migrationshinweis aus Diagnose

`twitch_events` beschreibt als aktuelle/gezielte Chatquellen:

- aktuelle Quelle: `twitch_presence/irc parallel bridge`
- Zielquelle: `twitch_events EventSub channel.chat.message`

Da weder der EventSub-Zähler noch die Bus-Subscriber echte Chatdeliveries zeigen, muss im nächsten Chat die echte, produktive Chat-Auswertung geprüft werden. Das kann ein bestehender Direct-Hook/Command-Path sein, der nicht über den erwarteten Bus läuft.

## Wichtiges Architekturziel

Forrest hat korrekt angemerkt: Chat darf nicht doppelt gemoppelt werden.

Zielarchitektur:

```text
Eine zentrale normalisierte Chatquelle
→ genau eine Verarbeitung pro Nachricht
→ Sound-Teilspiel prüft dieselbe Message
→ Satz-/Text-Teilspiel prüft dieselbe Message
→ gemeinsame Dedupe per messageId / Fallback-Key
→ Punkte/ChatOutputs/Overlays werden getrennt nach Teilspiel ausgelöst
```

Nicht weiterbauen:

```text
Twitch-Presence-Direct-Hook + handleIrcEvent-Hook + Wildcard-Bus-Fallback + weiterer Hook
```

Stattdessen:

1. echten produktiven Chat-Eingang finden,
2. normalisierte Message daraus erzeugen,
3. zentral an `processParallelChatMessage()` oder eine saubere gemeinsame Chat-Dispatch-Funktion geben,
4. Sound und Satz parallel auswerten,
5. doppelte Verarbeitung verhindern,
6. danach alte/unnötige Diagnose-/Fallback-Hooks gezielt entfernen oder deaktivieren.

## Status bisheriger EVS52.x-Schritte

### Stabil/bestanden

- EVS50.x: Punkte-Historie und Punktecheck Sound + Satz.
- EVS51.x: Satz-Testbereich, Satzpunkte, Worttrefferlogik, Duplikat-Schutz, kombinierter Abschluss.
- EVS51.6: Sound-Automatik plant ersten Schnipsel beim Eventstart.
- EVS52.2: permanentes Satzstatus-Overlay wieder versteckt, Feature vorbereitet gelassen.
- EVS52.3: Satzlösungs-Celebration-Overlay vorbereitet.
- EVS52.4: Satz-Spiel-Textvarianten und ChatOutputs vorbereitet.
- EVS52.5: Satz-Text-Aliase und Testscript bestanden; Worttreffer ohne Wortpunkte und Satzpunkte korrekt.

### Nicht fertig / kritisch

- EVS52.6–EVS52.8 waren Diagnose-/Fallback-Versuche, aber echte Twitch-Chatnachrichten erreichten `stream_events` weiterhin nicht belastbar.
- Aktueller Stand enthält zusätzliche Direct-/Fallback-Logik. Im nächsten Chat muss geprüft werden, was davon wirklich gebraucht wird und was wieder raus kann.
- Wichtig: Sound-Spiel darf nicht beschädigt werden.

## Nächster Arbeitsauftrag

**EVS52.9 – echte Chatquelle finden und zentrale Chat-Verarbeitung für Sound + Satz bauen**

Vor Codeänderung:

1. echte Dateien prüfen:
   - `backend/modules/stream_events.js`
   - `backend/modules/twitch_events.js`
   - `backend/modules/twitch_presence.js`
   - `backend/modules/communication_bus.js`
   - `backend/modules/helpers/helper_communication.js`
   - ggf. vorhandene Chat-/Command-/Sound-Answer-Dateien, wenn `stream_events.js` nicht allein zuständig ist
2. suchen:
   - Wo wird Sound-Antwort aktuell wirklich durch Chat ausgelöst?
   - Welche Funktion empfängt die Chatmessage?
   - Läuft sie über Bus, Direct-Hook, Commands oder eine andere Bridge?
3. dann Plan schreiben, betroffene Dateien nennen und auf `go` warten.

## Tests nach nächstem Fix

Pflichttests:

```powershell
node -c .\backend\modules\stream_events.js
node -c .\backend\modules\twitch_events.js
node -c .\backend\modules\twitch_presence.js
node -c .\htdocs\dashboard\modules\stream_events.js
```

Backend-Test:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\tests\EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1
```

Live-Tests:

1. laufendes Sound+Text-Event starten.
2. echtes Teilwort aus offenem Satz in Twitch-Chat schreiben.
3. Erwartung:
   - Worttreffer wird erkannt.
   - keine Wortpunkte, wenn `wordPointsEnabled=false`.
   - genau eine CGN-/Altersheim-Chatmeldung wird gesendet.
4. kompletten Satz schreiben.
5. Erwartung:
   - Satzpunkte werden gezählt.
   - Satzlösungs-Chatmeldung wird gesendet.
   - 15s Satzlösungs-Overlay erscheint.
6. Soundantwort testen.
7. Erwartung:
   - Soundspiel funktioniert weiter.
   - Soundpunkte werden gezählt.
   - Sound + Satz landen gemeinsam im Ranking.
8. Duplicate testen.
9. Erwartung:
   - keine neuen Punkte.
   - Duplicate-Meldung nur einmal/gewollt.

## Harte Regeln für den nächsten Chat

- Nicht raten.
- Keine weiteren Hooks stapeln, bevor die echte Chatquelle gefunden ist.
- Keine Funktionalität entfernen, aber ersetzte Diagnose-/Fallback-Altlasten nach Test gezielt bereinigen.
- Sound-Spiel muss nach jedem Fix getestet werden.
- Satz-Spiel muss nach jedem Fix getestet werden.
- Punkte müssen nach jedem Fix geprüft werden.
