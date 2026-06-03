# CAN-44.3 Auto-Shoutout UX + Meldungen + Start-Szene-Sperre

## Inhalt

Diese Lieferung erweitert CAN-44.1/44.2 um:

- Backend `clip_shoutout.js` Version 0.2.16
- Auto-SO Chatmeldungen für Warteliste, bereits eingereiht, bereits erhalten, Cooldown und Start-Szene
- Start-Szene-Sperre für DisplayQueue und OfficialQueue
- Dashboard: nur noch ein Feld `Twitch-Name` beim Hinzufügen/Bearbeiten
- Dashboard: DB-Settings für Meldungen und Start-Szene-Gate

## Start-Szene-Gate

Wenn die aktuelle OBS Program Scene einem Namen aus `sceneGate.startSceneNames` entspricht, werden keine Shoutouts ausgeführt:

- DisplayQueue bleibt `waiting` und bekommt `last_error=waiting_start_scene`
- OfficialQueue bleibt `waiting` und bekommt `last_error=waiting_start_scene`
- Auto-SO darf den Eintrag vormerken, startet aber nicht während der Start-Szene

Die Prüfung nutzt `obs_shared.getPublicStatus().currentProgramSceneName`.

## Neue/erweiterte Auto-SO Settings

```json
{
  "messages": {
    "queued": "📺 @{displayName} wurde der Shoutout-Warteliste hinzugefügt. Wartezeit: ca. {waitTime}.",
    "alreadyQueued": "⏳ @{displayName} steht bereits auf der Shoutout-Warteliste. Wartezeit: ca. {waitTime}.",
    "alreadyReceived": "✅ @{displayName} hat bereits einen Shouti erhalten.",
    "cooldown": "⏳ @{displayName} ist im Auto-SO-Cooldown. Nächster Versuch in ca. {waitTime}.",
    "waitingStartScene": "⏳ @{displayName} ist eingetragen. Shoutout wartet bis nach der Start-Szene. Wartezeit: ca. {waitTime}."
  },
  "sceneGate": {
    "enabled": true,
    "blockDuringStartScene": true,
    "startSceneNames": ["Stream startet", "Stream Start", "Start", "START", "Starting", "Stream starting"],
    "retryMs": 15000
  }
}
```

## Tests

Nach dem Entpacken:

```powershell
cd D:\Git\stream-control-center
node -c backend\modules\clip_shoutout.js
node -c htdocs\dashboard\modulesuto_shoutout.js
.\stepdone.cmd "CAN-44.3 Auto-Shoutout UX + Start-Szene-Sperre"
```

Danach Node neu starten und Dashboard hart neu laden.

## Prüfrouten

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/scene-gate" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto" | ConvertTo-Json -Depth 8
```

## Hinweise

- Live-Gate bleibt getrennt und wird nicht automatisch aktiviert.
- Es wird keine bestehende DB ersetzt oder gelöscht.
- Produktiv bleibt SQLite aktiv; die bestehende `database`-Helper-Schicht wird weiter genutzt.
