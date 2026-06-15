# LC-CORE-POINTS-3E – Doku-Update-Notizen

Stand: 2026-06-15

Diese Datei enthält die Einträge, die in die bestehenden Projektstandsdateien übernommen werden sollen. Die aktuellen Originaldateien `CURRENT_STATUS.md`, `TODO.md`, `NEXT_STEPS.md`, `FILES.md` und `CHANGELOG.md` lagen in diesem Chat nicht vollständig als echte aktuelle Dateien vor und wurden deshalb nicht blind überschrieben.

## Eintrag für CURRENT_STATUS.md

```md
## LC-CORE-POINTS-3E – Loyalty Twitch Event-Bonus-Pfad live bestätigt

Stand: 2026-06-15

Der Loyalty-Bonus-Pfad für Twitch-Events läuft jetzt produktiv über `twitch_events` und den Communication Bus.

Bestätigte Kette:

Twitch EventSub → `backend/modules/twitch.js` → `twitch_events.handleEventSubNotification(...)` → Communication Bus → `loyalty` gezielte Event-Bonus-Subscription → `recordEventBonus(...)` → Loyalty-Event + Transaktion.

Bestätigte Live-Events:

- `channel.cheer` / `twitch.cheer.received` mit `akighosty`
- `channel.follow` / `twitch.follow.received` mit `bossmod_cgn`

Aktuelle Versionen:

- `backend/modules/loyalty.js` Version `0.1.17`
- `backend/modules/twitch.js` Version `0.1.10`

Der alte direkte Loyalty-Forward in `twitch.js` ist standardmäßig deaktiviert und wird bei deaktiviertem Zustand nicht mehr pro Event aufgerufen. Notfall-Reaktivierung per `TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true` bleibt möglich.
```

## Eintrag für CHANGELOG.md

```md
### 2026-06-15 – LC-CORE-POINTS-3E

- Loyalty Twitch-Bonus-Events über `twitch_events` + Communication Bus live bestätigt.
- `loyalty` filtert Twitch-Bonus-Events jetzt über 7 gezielte Subscriptions statt breiter `received`-Subscription.
- `twitch.js` forwarded Support-EventSub-Events parallel an `twitch_events`.
- Legacy-Direktforward zu Loyalty standardmäßig deaktiviert.
- Deaktivierter Legacy-Direktforward wird nicht mehr pro Event aufgerufen, dadurch keine unnötigen `skipped`-Zähler.
- Live bestätigt mit `channel.cheer` und `channel.follow`.
```

## Eintrag für NEXT_STEPS.md

```md
## Nächster Schritt nach LC-CORE-POINTS-3E

Twitch Events als zentrale Alert-Event-Quelle vorbereiten.

Vor Umsetzung prüfen:

1. Aktuellen Stand von `backend/modules/alert_system.js` lesen.
2. Aktuellen Stand von `backend/modules/twitch_events.js` prüfen.
3. Prüfen, welche Follow/Sub/Resub/Gift/Cheer/Raid-Daten für Alerts gebraucht werden.
4. Prüfen, welche Alert- und Legacy-Pfade aktuell noch aktiv sind.
5. Keine Alert-Logik umbauen, bevor Ziel/Dateien/Änderung/Nichtänderung/Tests geklärt sind.
6. Auf `go` warten.
```

## Eintrag für TODO.md

```md
### Offen nach LC-CORE-POINTS-3E

- [ ] Alert-System-Anbindung an zentrale `twitch_events` prüfen und planen.
- [ ] Vor Entfernung alter Legacy-Pfade weitere Eventtypen prüfen oder sauber gesicherten dev-only Smoke-Test planen.
- [ ] `TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true` als Notfall-Fallback dokumentiert lassen.
- [ ] Donations/Tips separat als neutrales Payment-/Donation-Event planen, nicht als Twitch-natives Event.
```

## Eintrag für FILES.md

```md
### LC-CORE-POINTS-3E relevante Dateien

- `backend/modules/twitch.js` – EventSub-Empfang, Forwarding an `twitch_events`, deaktivierter Legacy-Loyalty-Direktforward.
- `backend/modules/loyalty.js` – gezielte Twitch-Event-Bonus-Subscriptions und Verarbeitung via `recordEventBonus()`.
- `backend/modules/twitch_events.js` – zentrale Twitch-Event-Mapping-/Publish-Schicht.
- `backend/modules/communication_bus.js` – zentrale Event-/Modul-Kommunikation.
- `docs/current/CURRENT_CHAT_HANDOFF_LC_CORE_POINTS_3E_DOCUMENTED.md` – aktueller Handoff.
- `docs/current/NEXT_CHAT_PROMPT_LC_CORE_POINTS_3E.md` – Prompt für nächsten Chat.
- `docs/modules/twitch_events_loyalty_bonus_events.md` – Modul-Doku zum Twitch-Events/Loyalty-Bonus-Pfad.
```
