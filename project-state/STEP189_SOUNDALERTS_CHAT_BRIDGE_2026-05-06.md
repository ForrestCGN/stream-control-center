# STEP189 - SoundAlerts Chat Bridge

Stand: 2026-05-06

## Zweck

Dieser STEP ergänzt eine erste Backend-Bridge für SoundAlerts-Chatmeldungen.

SoundAlerts bleibt für Viewer-Auswahl/Bits/Channel-Points zuständig. Das eigene System wertet die SoundAlerts-Chatmeldung aus, sucht ein lokales Mapping und spielt die Datei über das Sound-System ab.

## Betroffene Dateien

- `backend/modules/soundalerts_bridge.js`
- `config/soundalerts_bridge.json`
- `project-state/STEP189_SOUNDALERTS_CHAT_BRIDGE_2026-05-06.md`

## Wichtige Regeln

- Keine zweite persistente Twitch-Chat-Leseverbindung.
- Die Bridge hört intern auf die bereits vorhandenen WebSocket-Broadcasts von `twitch_chat_overlay.js`.
- Unbekannte SoundAlerts lösen keinen Sound und keine Chatmeldung aus.
- Unbekannte SoundAlerts werden als `unmatched` in SQLite geloggt.
- Bekanntes Mapping mit fehlender Datei wird als `file_missing` geloggt.
- Bei fehlender Datei kann eine kurze Chatmeldung gesendet werden, ohne Dateipfade im Chat auszugeben.
- Echte Medien liegen live unter `htdocs/assets/sounds/soundalerts/audio/` bzw. `htdocs/assets/sounds/soundalerts/video/`.
- Echte Medien werden nicht ins Repo committed.

## Neue Config

- `config/soundalerts_bridge.json`

Wichtige Einstellungen:

- `bot.login = soundalerts`
- `bot.userId = 216527497`
- `soundSystem.playUrl = http://127.0.0.1:8080/api/sound/play`
- `soundSystem.audioOutputTarget = device`
- `soundSystem.videoOutputTarget = overlay`
- `chatMessages.onMissingFile = true`
- `chatMessages.onUnmatched = false`

## Neue DB-Struktur

Tabelle:

- `soundalerts_bridge_events`

Gespeichert werden u. a.:

- Zeitpunkt
- Bot-Login/DisplayName
- auslösender User
- SoundAlert-Name
- Betrag/Währung
- Rohtext
- Status (`queued`, `unmatched`, `file_missing`, `failed`)
- Mapping-ID
- Sound-System-Request-ID
- Medien-Typ
- Datei
- Fehler

## Neue API-Routen

- `GET /api/soundalerts/status`
- `GET /api/soundalerts/events?limit=50`
- `GET /api/soundalerts/stats`
- `GET /api/soundalerts/config`
- `POST /api/soundalerts/config`
- `POST /api/soundalerts/reload`
- `POST /api/soundalerts/test/chat`

## Testbeispiel

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/test/chat" -Method Post -ContentType "application/json" -Body '{"login":"soundalerts","user":"SoundAlerts","text":"ForrestCGN spielt Fahrstuhl Sound für 0 Bits!"}' | ConvertTo-Json -Depth 30
```

Danach prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 30
```

## Bewusst offen

- Dashboard-UI für SoundAlerts-Settings, Mappings, Unmatched-Liste und Statistik folgt separat.
- Userinfo-Prüfung für den Bot ist vorbereitet, aber noch nicht als Dashboard-Button umgesetzt.
- Mapping-Verwaltung läuft in diesem STEP noch über Config.
