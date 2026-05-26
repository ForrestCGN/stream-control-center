# STEP405 – VIP EventBus Status Events

Stand: 2026-05-25
Status: CODE + DOKU

## Ziel

Das VIP-/Mod-Sound-System sendet bei echten Command-/API-Vorgängen zusätzlich Status-Events an den Communication/EventBus.

Der bestehende produktive Ablauf bleibt unverändert:

```text
/api/vip-sound/command
→ vip_sound_overlay.js prüft User, Rechte, Daily-Usage und Sounddatei
→ queueVipSoundInSoundSystem(...)
→ /api/sound/play
→ Sound-System steuert Queue und Playback
→ Overlay reagiert wie bisher auf sound_system WebSocket + /api/sound/status
```

## Geänderte Datei

```text
backend/modules/vip_sound_overlay.js
```

## Was eingebaut wurde

- Sicheres Laden von `./communication_bus`.
- Neuer Runtime-Statusblock `state.eventBus`.
- Neuer Public-/Status-Block `eventBus` in `/api/vip-sound/status` und `/api/vip-sound-overlay/status`.
- Neue Hilfsfunktionen:
  - `cleanVipBusAction(...)`
  - `vipBusActionForResult(...)`
  - `buildVipBusStatusPayload(...)`
  - `emitVipEventBusStatus(...)`
- `finishVipCommand(...)` sendet nach Chat-Antwort und Eventlog zusätzlich ein EventBus-Status-Event.

## EventBus-Kanal

```text
vip.sound
```

## EventBus-Actions

Mögliche Actions:

```text
accepted
modifier_accepted / override_accepted
duplicate
denied
override_denied
system_disabled
sound_missing
error
status
```

Hinweis: Die reale Action wird aus EventKey und Ergebnisdaten abgeleitet.

## Payload-Grundstruktur

```json
{
  "module": "vip_sound_overlay",
  "channel": "vip.sound",
  "action": "accepted",
  "eventKey": "accepted_vip",
  "eventType": "accepted",
  "accepted": true,
  "duplicate": false,
  "override": false,
  "dailyUsageWritten": true,
  "soundSystemQueued": true,
  "soundSystemStarted": false,
  "soundType": "vip",
  "usageDate": "YYYY-MM-DD",
  "actor": { "login": "...", "displayName": "..." },
  "target": { "login": "...", "displayName": "..." },
  "user": { "login": "...", "displayName": "...", "avatarUrl": "..." },
  "trigger": "!vip",
  "source": "streamerbot",
  "requestId": "vip_...",
  "soundSystemRequestId": "...",
  "soundFile": "vip/Name.mp3",
  "errorCode": "",
  "messageText": "...",
  "createdAt": "..."
}
```

## Safety

EventBus-Probleme dürfen den VIP-Sound niemals kaputtmachen.

Deshalb gilt:

- Wenn `communication_bus` nicht verfügbar ist, wird nur `state.eventBus.skipped` erhöht.
- Wenn `emit(...)` fehlschlägt, wird nur `state.eventBus.errors` erhöht und gewarnt.
- Der VIP-Command läuft weiter.
- Die Chat-Antwort läuft weiter.
- Sound-System und Queue laufen weiter.

## Bewusst NICHT geändert

- Keine Änderung an `/api/sound/play`.
- Keine Änderung am Sound-System.
- Keine Änderung an Sound-Queue oder Playback.
- Keine Änderung an Daily-Usage-Logik.
- Keine sichtbare Overlay-Designänderung.
- Keine `vip.overlay.show` Produktivanzeige.
- Keine Bus-only-Umstellung.
- Keine DB-Migration.

## Tests

Nach dem Entpacken:

```cmd
cd D:\Git\stream-control-center
node --check backend\modulesip_sound_overlay.js
```

Backend starten und prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
```

Danach einen normalen VIP-/Mod-Test auslösen und kontrollieren:

- VIP-Sound wird wie bisher vom Sound-System behandelt.
- `/api/vip-sound/status` zeigt `eventBus.lastAction` und Zähler.
- `/api/communication/status` zeigt neue Events im Bus-Kontext, sofern verfügbar.
