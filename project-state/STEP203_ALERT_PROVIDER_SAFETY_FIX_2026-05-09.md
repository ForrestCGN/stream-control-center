# STEP203 – Alert Provider Safety Fix

Stand: 2026-05-09

## Ziel

Akute Alert-Probleme aus STEP202.3 beheben:

1. TipeeeStream darf Twitch-Spiegelungen nicht mehr als Tipeee-Donation weiterleiten.
2. Global deaktivierte Alerts dürfen nicht mehr in Queue oder Alert-Playback landen.
3. Twitch Sub-/Resub-/Gift-/Sub-Bomben-Mapping wird eindeutiger.
4. Alert-History bekommt eine DB-basierte Route mit bis zu 100 Einträgen im Dashboard.

## Geänderte Dateien

```text
backend/modules/tipeee.js
backend/modules/alert_system.js
backend/modules/twitch.js
htdocs/dashboard/modules/alerts.js
config/alert_system.json
tools/test_step203_alert_provider_safety.ps1
docs/current/STEP203_ALERT_PROVIDER_SAFETY_FIX.md
docs/handoffs/NEXT_CHAT_HANDOFF_STEP203_ALERTS_2026-05-09.md
project-state/STEP203_ALERT_PROVIDER_SAFETY_FIX_2026-05-09.md
project-state/NEXT_STEPS_STEP203_ALERTS_2026-05-09.md
project-state/FILES_STEP203_ALERTS_2026-05-09.md
```

## Tipeee Twitch-Mirror-Filter

In `backend/modules/tipeee.js` wurde vor Allowed-Type-Prüfung, Provider-Event-Receive und Forward ein Mirror-Filter eingebaut.

Geblockt wird:

```text
origin === twitch
ref beginnt mit TWITCH_
type ist ein bekannter Twitch-Typ:
cheer, raid, follow, sub, resub, subscription, gift, gift_sub,
gifted_subscription, channel.cheer, channel.raid, channel.follow,
channel.subscribe, channel.subscription.gift, channel.subscription.message
```

Geblockte Tipeee-Twitch-Spiegelungen:

```text
- gehen nicht an /api/alerts/enqueue
- landen nicht in der Alert-Queue
- erzeugen keinen alert_events-Eintrag
- lösen keinen Sound, kein TTS und kein Overlay aus
- werden optional in alert_provider_events mit status ignored_twitch_mirror dokumentiert
```

## Globaler Alert-Disable vor Queue

In `backend/modules/alert_system.js` wurde `alertQueueGate()` ergänzt.

Blockiert wird jetzt vor Rule-Lookup und vor Queue/DB-Insert:

```text
state.config.enabled === false -> alerts_disabled
state.config.queueEnabled === false -> alert_queue_disabled
```

Betroffen:

```text
/api/alerts/enqueue
/api/alerts/test
/api/alerts/twitch/*
Replay über /api/alerts/events/:eventUid/replay
interne Display-/Test-Preset-Playbacks
```

Damit werden bei deaktivierten Alerts keine neuen Queue-Einträge und keine neuen `alert_events` erzeugt.

Zusätzlich blockt `processQueue()` defensiv, wenn `enabled` oder `queueEnabled` deaktiviert wurde.

## Twitch Subscription Mapping

In `backend/modules/twitch.js` wurde das Mapping angepasst:

```text
sub -> sub
resub -> resub
single gift -> gift_sub
community gift / sub bomb -> gift_bomb
```

Bei `channel.subscription.gift` wird `total`/`cumulative_total` ausgewertet.

Zusätzlich werden Meta-Felder im Raw-Payload gesichert:

```text
gifter_login
gifter_name
recipient_login
recipient_name
tier
total
cumulative_total
is_anonymous
communityGift
```

Wichtig: Das bestehende Alert-System nutzt lowercase/snake_case Type-Keys. Deshalb bleiben `gift_sub` und `gift_bomb` erhalten, statt neue inkompatible CamelCase-Keys einzuführen.

## DB-basierte Alert-History

Neue Route:

```text
GET /api/alerts/events?limit=100
```

Quelle:

```text
alert_events
LEFT JOIN alert_rules
```

Das Dashboard `htdocs/dashboard/modules/alerts.js` lädt diese Route zusätzlich und nutzt sie für:

```text
Übersicht -> Letzte 5 Alerts
Letzte Alerts / History
Testcenter -> Letzte Alerts
```

`/api/alerts/status.history` wurde als Fallback erhalten, aber von 10 auf 50 erhöht. RAM-History wurde von 25 auf 100 erhöht.

## Syntaxcheck

Lokal im Build geprüft:

```text
node -c backend/modules/tipeee.js
node -c backend/modules/alert_system.js
node -c backend/modules/twitch.js
node -c htdocs/dashboard/modules/alerts.js
```

## Nicht geändert

```text
Keine Secrets
Keine .env
Keine SQLite-Datei
Keine Datenbank überschrieben
Keine bestehenden Routen entfernt
Keine bestehenden Gift-Sub-Typen entfernt
Keine Dashboard-Module neu strukturiert
```

## Nach Entpacken

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "fix: filter mirrored provider alerts and improve alert history"
```

## Nach Live-Deploy testen

```powershell
cd D:\Git\stream-control-center
.\tools\test_step203_alert_provider_safety.ps1
```

## Offene Punkte

```text
- Echte Live-Events Twitch Bits/Raid/Sub/GiftSub/Sub-Bombe im Stream prüfen.
- Dashboard-Config-UX für globalen Alert-Schalter später schöner machen.
- Falls bestehende Regeln nur alte Typen nutzen, GiftSub/Sub-Bombe-Regeln im Dashboard prüfen/anlegen.
```
