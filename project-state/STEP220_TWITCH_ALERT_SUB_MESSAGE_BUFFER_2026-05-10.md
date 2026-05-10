# STEP220 - Twitch Alert Subscribe/Resub Message Buffer

Stand: 2026-05-10

## Ziel

Twitch kann rund um Subscriptions zwei EventSub-Signale fuer denselben User liefern:

- `channel.subscribe`
- `channel.subscription.message`

Bisher wurden beide Signale sofort an das Alert-System weitergeleitet. Wenn beide Events kurz nacheinander kamen, konnten dadurch zwei sichtbare Sub-Alerts nacheinander abgespielt werden.

STEP220 fuehrt deshalb einen kleinen Puffer in der Twitch-Alert-Bridge ein.

## Geaendert

```text
backend/modules/twitch.js
project-state/STEP220_TWITCH_ALERT_SUB_MESSAGE_BUFFER_2026-05-10.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

## Verhalten nach STEP220

- `channel.subscribe` wird fuer 30 Sekunden gepuffert.
- Wenn innerhalb dieser 30 Sekunden fuer denselben User ein `channel.subscription.message` kommt:
  - der gepufferte Subscribe-Alert wird verworfen,
  - die Subscription-Message / der Resub-Alert wird sofort weitergeleitet.
- Wenn innerhalb der 30 Sekunden keine Subscription-Message kommt:
  - der gepufferte Subscribe-Alert wird nach Ablauf des Puffers normal an `/api/alerts/twitch` weitergeleitet.
- Wenn die Reihenfolge umgekehrt ist und zuerst `channel.subscription.message` kommt:
  - diese Message wird sofort weitergeleitet,
  - ein kurz danach kommender `channel.subscribe` fuer denselben User wird unterdrueckt.

## Technische Umsetzung

- In-Memory-Puffer in `backend/modules/twitch.js`.
- Keine neue Tabelle.
- Keine DB-Migration.
- Keine neue Datei fuer Runtime-State.
- Neuer Default-Config-Block in `DEFAULT_TWITCH_ALERT_CONFIG`:

```js
subMessageBuffer: {
  enabled: true,
  delayMs: 30000
}
```

Die effektive Runtime-Config wird wie bisher aus `alert_settings` / `provider_twitch_eventsub` geladen und mit Defaults gemerged.

## Statusausgabe

`/api/twitch/alerts/status` zeigt zusaetzlich:

```json
"subMessageBuffer": {
  "enabled": true,
  "delayMs": 30000,
  "pendingSubscribeAlerts": 0,
  "recentSubscriptionMessages": 0
}
```

`recent` kann neue Aktionen enthalten:

- `buffered`
- `buffer_flushed`
- `buffer_replaced`
- `skipped` mit Gruenden wie `sub_message_replaced_buffered_subscribe` oder `sub_message_already_forwarded`

## Bewusst nicht geaendert

- `backend/modules/alert_system.js`
- Alert-Queue
- Alert-Regeln
- Alert-Sounds
- Alert-Designs
- Dashboard
- Loyalty
- Kofi
- Tipeee
- SQLite-Schema
- `app.sqlite`

## Syntaxcheck

```powershell
node --check .\backend\modules\twitch.js
```

Erwartung: keine Ausgabe, Exitcode 0.

## Minimaler Live-Test nach Deploy/Backend-Neustart

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 40
```

Erwartung:

- `subMessageBuffer.enabled = true`
- `subMessageBuffer.delayMs = 30000`
- keine `lastError`

Optional nur off-stream oder mit deaktiviertem Live-Overlay testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/test?type=sub&user=BufferTest&display=BufferTest" | ConvertTo-Json -Depth 20
Start-Sleep -Seconds 5
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/test?type=resub&user=BufferTest&display=BufferTest&amount=12" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 40
```

Erwartung:

- erster Test liefert `alertResult.buffered = true`,
- zweiter Test ersetzt den gepufferten Subscribe,
- `recent` zeigt `buffer_replaced`,
- es wird nur der Resub/Sub-Message-Alert weitergeleitet.

## Offene Punkte

- Im naechsten echten Stream beobachten, ob Penny-/Urlug-Fall korrekt geloest ist.
- Wenn Twitch in der Praxis mehr als 30 Sekunden Abstand zwischen Subscribe und Subscription-Message liefert, kann `subMessageBuffer.delayMs` spaeter konfigurierbar hoeher gesetzt werden.
