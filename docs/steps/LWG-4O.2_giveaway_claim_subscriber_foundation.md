# STEP LWG-4O.2 – Giveaway Claim Subscriber Foundation

## Ziel

`loyalty_giveaways` subscribed jetzt direkt auf das zentrale Twitch-Chat-Event:

- Channel: `twitch.chat`
- Action: `message`
- Contract: `twitch.chat.message`

Damit ist die Grundlage gelegt, damit Giveaways später Gewinner-Meldungen im Chat erkennen können, ohne Twitch-Chat direkt abzufragen und ohne ein eigenes Bridge-Modul.

## Geänderte Dateien

- `backend/modules/loyalty_giveaways.js`

## Architektur

Der neue Weg ist:

```text
twitch_presence / twitch_events
→ Communication Bus: twitch.chat.message
→ loyalty_giveaways Subscriber
→ später: aktive Claim-Fenster / Gewinner-Abgleich
```

## Was dieser Step bewusst noch nicht macht

Dieser Step ist nur die sichere Subscriber-Grundlage:

- keine Gewinner-Status-Migration
- keine automatische Gewinner-Bestätigung
- keine Wheel-Permission-Änderung
- keine Ticket-/Command-Änderung
- keine bestehende Runtime-Logik entfernt

Der Subscriber nimmt Events entgegen, zählt sie und skipped sofort, solange noch kein echtes Claim-Fenster existiert.

## Neue Diagnose

Statusroute:

```text
GET /api/loyalty/giveaways/chat-claim/status
```

Wichtige Felder:

```text
subscriber.registered
subscriber.seen
subscriber.skipped
subscriber.skippedNoClaimWindow
subscriber.lastUserLogin
subscriber.lastMessagePreview
```

Außerdem erscheint der Subscriber im normalen Giveaway-Status unter:

```text
diagnostics.chatClaimSubscriber
```

## Bus-Lastschutz

Der Subscriber macht in diesem Step nur minimale Arbeit:

1. Chat-Event normalisieren.
2. User/Login prüfen.
3. Prüfen, ob Claim-Fenster aktiv ist.
4. Aktuell immer skip mit `claim_window_not_enabled_yet`.

Damit kann live getestet werden, ob `loyalty_giveaways` Chat-Events über den Bus empfängt, ohne bestehende Giveaway-/Wheel-Funktionalität zu verändern.

## Tests

Syntax:

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

Status nach Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/chat-claim/status" | ConvertTo-Json -Depth 10
```

Erwartung:

```text
ok = true
moduleBuild = STEP_LWG_4O_2
subscriber.registered = true
busContract.channel = twitch.chat
busContract.action = message
foundationOnly = true
```

Wenn eine Chatnachricht im Twitch-Chat eingeht, sollte `subscriber.seen` steigen und `subscriber.skippedNoClaimWindow` ebenfalls steigen, solange LWG-4O.3 noch nicht umgesetzt ist.

## StepDone

```powershell
.\stepdone.cmd "STEP LWG-4O.2 Giveaway Claim Subscriber Foundation"
```
