# STEP225 - Twitch EventSub Inbound Audit

Stand: 2026-05-11

## Ziel

Echte eingehende Twitch/EventSub-Notifications werden vor und nach der Alert-Normalisierung protokolliert, damit Stream-Ungereimtheiten nachvollziehbar werden.

Damit soll eindeutig geprüft werden können:

- ob Twitch wirklich `channel.subscribe`, `channel.subscription.message`, `channel.cheer`, `channel.subscription.gift` usw. geschickt hat,
- welche Rohdaten im Event enthalten waren,
- was die Twitch-Alert-Bridge daraus normalisiert hat,
- ob das Event weitergeleitet, gepuffert, übersprungen oder fehlerhaft verarbeitet wurde.

## Geändert

```text
backend/modules/twitch.js
```

## Neue Route

```text
GET /api/twitch/alerts/audit/recent
GET /twitch/alerts/audit/recent
```

Optionale Query:

```text
?limit=50
```

## Neue Runtime-/Config-Erweiterung

Die Twitch-Alert-Bridge bekommt eine neue Config-Sektion mit Defaults:

```json
"eventSubAudit": {
  "enabled": true,
  "logPath": "data/logs/twitch_eventsub_audit.jsonl",
  "recentLimit": 50,
  "maxFileBytes": 5242880
}
```

Der relative Pfad wird gegen den Projekt-/Live-Root aufgelöst.

Live-Zielpfad standardmäßig:

```text
D:\Streaming\stramAssets\data\logs	witch_eventsub_audit.jsonl
```

## Audit-Inhalt pro Event

Pro echter EventSub-Notification wird eine JSONL-Zeile geschrieben:

```json
{
  "receivedAt": "...",
  "source": "twitch_eventsub",
  "transport": "websocket",
  "messageType": "notification",
  "messageId": "...",
  "messageTimestamp": "...",
  "subscriptionType": "channel.subscribe",
  "subscriptionId": "...",
  "subscriptionVersion": "1",
  "condition": {},
  "userLogin": "...",
  "userName": "...",
  "summary": {
    "bits": null,
    "tier": "1000",
    "isGift": false,
    "total": null,
    "messageText": ""
  },
  "normalizedAlert": {
    "type": "sub",
    "amount": 1,
    "message": "",
    "title": "..."
  },
  "decision": {
    "alertForward": "buffered|forwarded|skipped|failed",
    "reason": "..."
  },
  "rawEvent": {}
}
```

## Wichtig

- Die Alert-Verarbeitung wird nicht fachlich verändert.
- Die bestehende Sub-/Resub-Pufferlogik aus STEP220 bleibt unverändert aktiv.
- Die Debug-Simulator-Routen aus STEP221 bleiben unverändert.
- Die Sub-Tier-Message-Korrektur aus STEP222 bleibt unverändert.
- Die Cheer-Wort-Bereinigung für TTS aus STEP223 bleibt unverändert.
- Die Dashboard-Simulator-UI aus STEP224 bleibt unverändert.
- Keine DB-Tabelle und keine Migration.
- `app.sqlite` wird nicht verändert.

## Tests nach Deploy

Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 60
```

Audit lesen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/audit/recent?limit=20" | ConvertTo-Json -Depth 80
```

Nach dem nächsten echten Twitch-Event sollte mindestens ein Audit-Eintrag erscheinen.

## Rollback

Nur `backend/modules/twitch.js` aus dem vorherigen Stand zurückspielen.
