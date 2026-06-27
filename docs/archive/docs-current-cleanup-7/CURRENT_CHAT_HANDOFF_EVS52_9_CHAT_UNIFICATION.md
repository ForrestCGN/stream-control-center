# CURRENT CHAT HANDOFF – EVS52.9 Chatquelle / Sound + Satz vereinheitlichen

Stand: 2026-06-18
Letzter Code-Stand im Live-/Repo-Test: `stream_events 0.5.79 / STEP_EVS52_8_TWITCH_CHAT_BUS_FALLBACK`.

## Warum dieser Handoff

Die Arbeit wurde gestoppt, weil mehrere Hook-/Fallback-Versuche entstanden sind und Forrest zu Recht verlangt hat, nicht weiter zu raten. Bevor weitere Codeänderungen passieren, muss die echte Chatquelle sauber geprüft werden.

## Fachliche Entscheidung

Chat soll **einmal zentral empfangen** und dann für beide Teilspiele genutzt werden:

```text
Twitch-Chat normalisiert
→ Sound-Spiel prüft Antwort
→ Satz-Spiel prüft Worttreffer/Satzlösung
→ beide schreiben in dieselbe Event-Wertung
```

Kein doppeltes Gemoppel.

## Aktueller Befund aus Diagnose

Communication-Bus:

- `communication_bus` läuft.
- `stream_events` ist registriert und meldet `consumes:twitch.chat.message`.
- `twitch_events` ist registriert und kann `twitch.chat.message` publishen.
- Event-Catalog kennt `twitch.chat.message` als `channel=twitch.chat`, `action=message`.

Aber:

- spezifischer Subscriber `stream_events:twitch.chat.message` hat `delivered=0`.
- weitere spezifische Chat-Subscriber wie `commands`, `clip_shoutout`, `loyalty_giveaways` hatten ebenfalls `delivered=0`.
- `twitch_events.eventSubChat` ist zwar aktiv und Subscription ist enabled, aber `notifications=0`, `chatMessagesEmitted=0`.
- Der EVS52.8-Wildcard bekam Deliveries, aber das waren nicht belastbar Chatmessages, sondern allgemeine Bus-Events/Heartbeats/Status.

Konsequenz: Nicht weiter blind am Bus-Fallback bauen. Zuerst finden, wo der produktive Chat für das Sound-Spiel wirklich ankommt.

## Bestätigt funktionierende Bereiche

- Punkte-Historie im aktuellen Event.
- Sound- und Satzpunkte werden gemeinsam addiert, aber getrennt angezeigt.
- Satz-Testbereich Backend/Dashboard funktioniert.
- Worttreffer können ohne Wortpunkte erkannt werden.
- Satzlösung vergibt korrekte Punkte.
- Duplicate-Satzlösung gibt keine Punkte.
- Kombi-Abschluss Sound+Text funktioniert im Test.
- Sound-Automatik plant beim Eventstart den ersten Schnipsel.
- Satzlösung-Overlay ist vorbereitet, dauerhaftes Satzstatus-Overlay ist versteckt.
- Textvarianten/Fallbacks für Satz-Spiel sind vorbereitet.

## Kritischer offener Punkt

Echte Twitch-Chatmessages erreichen `stream_events` für das Satz-System noch nicht zuverlässig. Es darf nicht angenommen werden, dass der bisherige Bus-Subscriber greift.

## Nächster Step: EVS52.9

### Ziel

Echte produktive Chatquelle finden und daraus eine zentrale Chat-Verarbeitung für Sound + Satz bauen.

### Zwingend zuerst prüfen

Dateien:

```text
backend/modules/stream_events.js
backend/modules/twitch_events.js
backend/modules/twitch_presence.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
```

Falls Soundantworten in anderen Dateien laufen, exakt diese Dateien anfordern/prüfen, nicht raten.

Suchen nach:

```text
twitch.chat.message
handleIrcEvent
emitTwitchChatEvent
processParallelChatMessage
processSoundChatMessage
sound answer / answer_checked / sound.solved
bus.subscribe
communicationBus.subscribe
helper_communication.subscribe
```

### Erwartete saubere Lösung

Eine zentrale Funktion für eingehende Chatmessages, z. B. sinngemäß:

```text
handleNormalizedChatMessage(message)
  -> Dedupe
  -> RuntimeGate prüfen
  -> Sound prüfen
  -> Text/Satz prüfen
  -> ChatOutputs live nur bei echter Chatquelle
```

Nicht mehrere parallele Hooks, die alle dasselbe versuchen.

## Bestehende problematische/zu prüfende EVS52.6–EVS52.8-Arbeiten

Folgende Erweiterungen wurden gebaut und müssen im nächsten Chat geprüft/bereinigt werden:

- EVS52.6 Direct-Bridge über `twitch_events.handleIrcEvent`.
- EVS52.7 Direct-Bridge über `twitch_presence`.
- EVS52.8 Wildcard-Bus-Fallback.

Wenn die echte zentrale Chatquelle gefunden ist, diese Alt-/Diagnosepfade nicht dauerhaft mitschleppen, sondern gezielt entfernen/deaktivieren, sofern nicht gebraucht.

## Pflichttests nach Fix

1. `node -c` für betroffene JS-Dateien.
2. EVS52.5 Testscript:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\tests\EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1
```

3. Live-Chat Teilwort aus offenem Satz.
4. Live-Chat kompletter Satz.
5. Live-Chat Duplicate.
6. Soundantwort im laufenden Event.
7. Punkte-/Ranking-/User-Historie prüfen.
8. ChatOutput-Helper prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/chat-output/status" | ConvertTo-Json -Depth 8
```

## Arbeitsregeln

- Vor Umsetzung echte Dateien prüfen.
- Plan schreiben: Ziel, Dateien, Änderung, Nicht geändert, Tests.
- Auf Forrests `go` warten.
- Fehlende Dateien exakt anfordern.
- Keine Apply-/Patch-Scripte.
- ZIPs mit echten Zielpfaden ab Repo-Root.
- StepDone nach Einspielen:

```powershell
.\stepdone.cmd "EVS52.9 Chatquelle Sound und Satz vereinheitlichen"
```

- Erst nach StepDone testen.
