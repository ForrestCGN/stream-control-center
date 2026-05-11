# STEP227 – Twitch DB-Helper-Cleanup

Datum: 2026-05-10

## Ziel

`backend/modules/twitch.js` soll im Bereich der Twitch-Alert-Bridge weniger direktes SQLite-Upsert-SQL enthalten und stattdessen die zentrale DB-Schicht `backend/core/database.js` nutzen.

SQLite bleibt weiterhin produktiv aktiv. MySQL/MariaDB bleiben vorbereitet, aber inaktiv.

## Geändert

Betroffene Datei:

- `backend/modules/twitch.js`

Änderung:

- Der Upsert in `saveTwitchAlertSettingsToDb(...)` nutzt jetzt `database.upsert(...)`.
- Die direkte `ON CONFLICT(key) DO UPDATE ...`-Stelle wurde aus `twitch.js` entfernt.
- Die Daten bleiben unverändert in `alert_settings` unter dem Key `provider_twitch_eventsub`.

## Bewusst nicht geändert

- Keine Twitch-OAuth-Logik.
- Keine Helix-Routen.
- Keine EventSub-WebSocket-Logik.
- Keine Alert-Forwarding-Logik.
- Keine Twitch-Token-Dateien.
- Keine Tabellenstruktur.
- Keine Datenmigration.
- Kein MySQL-/MariaDB-Treiber.
- Keine Änderung an `backend/core/database.js`.
- Keine Änderung an `backend/modules/sqlite_core.js`.

## Syntaxcheck

```powershell
node --check backend\modules\twitch.js
```

## Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

## Erwartung

- `ok = true` bei Twitch Alert Bridge.
- `settingsSource = core_database`.
- EventSub bleibt verbunden oder im erwarteten Reconnect-Status.
- `lastError` bleibt leer.
- `database.status.adapter = sqlite`.
