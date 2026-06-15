# NEXT_STEPS – stream-control-center

Stand: 2026-06-15

## Neuer Chat – Startpunkt

Im neuen Chat mit folgendem Block weitermachen:

```text
LC-CORE-POINTS-3A – Twitch Events als abonnierbare Bonus-Events vorbereiten
```

## Ausgangslage

```text
LC-CORE-CLEANUP-1 bestätigt.
LC-CORE-POINTS-1 bestätigt.
LC-CORE-POINTS-2A bestätigt.
LC-CORE-POINTS-2B bestätigt.
LC-CORE-POINTS-2C bestätigt.
forrestcgn wurde wieder als Ignored-User gesetzt.
```

## Wichtige Entscheidung

Der direkte EventBonus-Test per `/api/loyalty/events/ingest` wird zurückgestellt.

Stattdessen soll zuerst `twitch_events` als zentrale Event-Schicht erweitert werden, damit mehrere Module dieselben Events abonnieren können:

```text
Twitch / EventSub / IRC / spätere Quellen
        ↓
twitch_events
        ↓
Communication Bus
        ↓
loyalty / alerts / dashboard / event-system
```

## Erster Schritt im neuen Chat

### 1. Echte Dateien prüfen

```text
backend/modules/twitch_events.js
backend/modules/loyalty.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/FILES.md
docs/current/CHANGELOG.md
```

### 2. Event-Katalog und EventSub-Mapping prüfen

Klären:

```text
Welche EventKeys existieren bereits?
Welche EventSub-Typen werden normalisiert?
Welche Events werden schon über publishTwitchEvent() publiziert?
Welche Events fehlen oder sind nur teilweise vorhanden?
```

### 3. Ziel-EventKeys festlegen

```text
twitch.follow
twitch.subscribe
twitch.resub
twitch.gift_sub
twitch.gift_bomb
twitch.cheer
twitch.raid
```

### 4. Payload-Vertrag festlegen

Mindestens:

```json
{
  "eventKey": "twitch.subscribe",
  "provider": "eventsub",
  "sourceModule": "twitch_events",
  "user": {
    "login": "example",
    "displayName": "Example",
    "id": "123"
  },
  "recipient": null,
  "tier": "1000",
  "quantity": 1,
  "months": 1,
  "bits": 0,
  "viewers": 0,
  "raw": {}
}
```

### 5. Loyalty-Subscriber planen

Mapping:

```text
twitch.follow       → recordEventBonus({ eventType: "follow" })
twitch.subscribe    → recordEventBonus({ eventType: "subscribe" })
twitch.resub        → recordEventBonus({ eventType: "resub" })
twitch.cheer        → recordEventBonus({ eventType: "cheer" })
twitch.raid         → recordEventBonus({ eventType: "raid" })
twitch.gift_sub     → recordEventBonus({ eventType: "gift_sub" })
twitch.gift_bomb    → recordEventBonus({ eventType: "gift_bomb" })
```

## Tests nach Umsetzung

```text
1. node -c backend/modules/twitch_events.js
2. node -c backend/modules/loyalty.js
3. Bus-Test: twitch_events publiziert Testevent.
4. Loyalty-Subscriber-Test: Event landet in loyalty_events.
5. Transaction-Test: event_bonus wird korrekt gebucht.
6. Ignored-Test: forrestcgn wird ignoriert.
7. Duplicate-Test: gleiche eventUid wird dedupliziert.
8. Doku aktualisieren.
```

## StepDone nach Umsetzung

Nur nach tatsächlicher Code-/Doku-Umsetzung:

```powershell
.\stepdone.cmd "LC-CORE-POINTS-3A Twitch EventBus Bonus Events vorbereitet"
```

## Nicht tun

```text
Keine produktive SQLite ersetzen.
Keine Commands aktivieren.
Keine Live-/Shadow-Umstellung.
Keine neue parallele Event-Schicht bauen.
Keine Loyalty-Direktanbindung an Twitch-Sonderfälle.
Keine Apply-/Patch-/Regex-Scripte.
```
