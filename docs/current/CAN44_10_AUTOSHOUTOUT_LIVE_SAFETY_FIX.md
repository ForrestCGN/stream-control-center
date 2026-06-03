# CAN-44.10 AutoShoutout Live-Safety Fix

## Ziel

Dieser Fix korrigiert zwei Live-Probleme im AutoShoutout-System:

1. AutoShoutout-Skip-Meldungen wie `cooldown`, `alreadyReceived` und `disabled` werden nicht mehr in den Chat gepostet.
2. `reset-day` entfernt keine bereits erfolgreich abgespielten Display-Shoutouts mehr. Dadurch bleibt die Tages-/Cooldown-Sperre für Streamer erhalten, die heute bereits einen Shouti bekommen haben.

## Geänderte Datei

- `backend/modules/clip_shoutout.js`

## Version

- `clip_shoutout` von `0.2.20` auf `0.2.21`

## Details

### Chat-Skip-Meldungen

Folgende AutoShoutout-Zustände sind ab jetzt immer intern/stumm:

- `alreadyReceived`
- `cooldown`
- `disabled`

Das gilt unabhängig davon, ob in der Config noch Text für diese Keys steht.

Erlaubt bleiben:

- `queued`
- `alreadyQueued`
- `waitingStartScene`

### Reset-Day-Verhalten

`POST /api/clip-shoutout/auto/reset-day` entfernt jetzt nur noch offene/problematische Queue-Einträge:

- `queued`
- `waiting`
- `active`
- `failed`

Erfolgreich abgeschlossene Display-Einträge mit Status `done` bleiben erhalten.

AutoShoutout-Events werden nur noch gelöscht, wenn sie nicht `triggered` sind oder wenn sie zu einem entfernten offenen DisplayQueue-Eintrag gehören.

## Einspielen

```powershell
cd D:\Git\stream-control-center
node -c backend\modules\clip_shoutout.js
.\stepdone.cmd "CAN-44.10 AutoShoutout Live-Safety Fix"
```

Danach Node neu starten.

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto" |
  ConvertTo-Json -Depth 6
```

Erwartet:

- `moduleVersion`: `0.2.21`

Cooldown/AlreadyReceived dürfen bei echten AutoShoutout-Skips nicht mehr im Chat erscheinen.
