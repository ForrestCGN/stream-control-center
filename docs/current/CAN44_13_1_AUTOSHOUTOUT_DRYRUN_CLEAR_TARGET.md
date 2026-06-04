# CAN-44.13.1 AutoShoutout Dry-Run + Clear Target

## Ziel

Sicherheits-Hotfix nach dem CAN-44.13-Testlauf:

- `/api/clip-shoutout/auto/test-chat` ist jetzt standardmäßig ein Dry-Run.
- Ein echter Test muss bewusst mit `execute=true` oder `dryRun=false` gestartet werden.
- Neuer gezielter Clear-Endpunkt für einzelne AutoShoutout-Streamer.

## Geänderte Datei

- `backend/modules/clip_shoutout.js`

## Version

- `clip_shoutout` Modulversion: `0.2.23`

## Neue/angepasste Routen

### POST `/api/clip-shoutout/auto/test-chat`

Standard: Dry-Run.

Dry-Run Beispiel:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/test-chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"login":"fadjoe81","displayName":"fadjoe81","message":"Testnachricht"}' |
  ConvertTo-Json -Depth 8
```

Echter Test nur bewusst:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/test-chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"login":"fadjoe81","displayName":"fadjoe81","message":"Testnachricht","execute":true}' |
  ConvertTo-Json -Depth 8
```

Alternativ:

```json
{"dryRun": false}
```

### POST `/api/clip-shoutout/auto/clear-target`

Setzt gezielt AutoShoutout-Teststatus für einen Streamer zurück.

Beispiel für FadJoe vor dem Stream:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/clear-target" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"login":"fadjoe81","reason":"test_clear_before_stream"}' |
  ConvertTo-Json -Depth 8
```

Der Endpoint entfernt/neutralisiert nur den angegebenen Zielstreamer seit Tagesbeginn bzw. optional seit `since`:

- passende AutoShoutout-Events
- passende AutoShoutout-Message-Activity
- passende DisplayQueue-Einträge (`queued`, `waiting`, `active`, `done`, `failed`) werden auf `removed` gesetzt
- passende OfficialQueue-Einträge werden auf `removed` gesetzt
- passende OfficialHistory-Einträge ab `since` werden gelöscht, damit Test-Cooldowns nicht den echten Stream blockieren

## Wichtige Hinweise

- `onlyWhenLive=false` bleibt unverändert und kann für heutige Streamtests weiter genutzt werden.
- Der Clear-Endpunkt ist zielgerichtet und löscht keine anderen Streamer.
- Für echte AutoShoutouts im Stream bleibt CAN-44.13 erhalten: Standard 3 Nachrichten innerhalb von 30 Minuten + Begrüßungsvarianten.

## Tests

Syntaxcheck:

```powershell
cd D:\Git\stream-control-center
node -c backend\modules\clip_shoutout.js
```

Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto" |
  ConvertTo-Json -Depth 10
```
