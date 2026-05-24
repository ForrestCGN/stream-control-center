# STEP278F — Communication Bus Security/Audit Hooks

Status: Helper extension prepared  
Production migration: none  
Default audit logging: disabled

## Ziel

`backend/modules/helpers/helper_communication.js` kann jetzt optional mit Security Context und Audit Logger arbeiten.

Der Bus bleibt weiterhin ohne produktive Modul-Migration vorbereitet.

## Neue optionale Hooks

```js
createCommunicationBus({
  config,
  security,
  auditLogger
})
```

## Verhalten

Wenn `security` oder `auditLogger` nicht übergeben werden, läuft der Bus wie bisher weiter.

Wenn ein Audit Logger übergeben wird und `config.audit.enabled === true` ist, können optional geloggt werden:

- `bus.emit`
- `bus.ack`
- `bus.issue`

## Default-Config

In `config/communication_bus.json` bleibt Audit bewusst deaktiviert:

```json
{
  "security": { "enabled": true },
  "audit": {
    "enabled": false,
    "logEmit": false,
    "logAck": false,
    "logIssues": true,
    "logPayload": false
  }
}
```

## Bewusst nicht geändert

- kein `server.js`-Umbau
- keine Migration von Alert/Sound/TTS/VIP
- keine Dashboard-Seite
- keine Datenbankmigration
- kein Ersatz von `broadcastWS`
- keine produktive Audit-Pflicht
