# STEP192.2 - SoundAlerts Settings in DB

Stand: 2026-05-06

## Zweck

SoundAlerts Bridge technische Einstellungen werden primaer ueber eine DB-Settings-Schicht verwaltet. JSON bleibt weiterhin Seed/Fallback und wird nicht entfernt.

## Ausgangslage

Vorheriger stabiler Stand:

- SoundAlerts Bridge Version `0.1.3`
- Entries/Mappings liegen primaer in `soundalerts_bridge_entries`
- Events/Logs liegen in `soundalerts_bridge_events`
- `config/soundalerts_bridge.json` bleibt Seed/Fallback
- Getesteter Eintrag `fahrstuhl_sound` laeuft korrekt ueber:
  - Kategorie `channel_reward`
  - Output `overlay`
  - Volume `100`
  - effektive Prioritaet `70`

## Geaenderte Datei

- `backend/modules/soundalerts_bridge.js`

## Neue Version

- `soundalerts_bridge` Version: `0.1.4`

## Neue DB-Settings-Tabelle

- `soundalerts_bridge_settings`

Die Tabelle wird ueber den vorhandenen zentralen Helper genutzt:

- `backend/modules/helpers/helper_settings.js`

Damit gilt weiterhin der vorhandene Projektstandard:

1. DB ist primaere Quelle fuer dashboardfaehige Settings.
2. JSON bleibt Fallback/Seed.
3. Code-Defaults bleiben letzte Rueckfallebene.
4. Keine neue Parallelstruktur.

## Neue / aktualisierte API-Routen

### GET `/api/soundalerts/settings`

Liefert:

- Settings aus `soundalerts_bridge_settings`
- Settings-Definitionen fuer Dashboard/Admin-Oberflaeche
- effektive aktuelle SoundAlerts-Konfiguration

### POST `/api/soundalerts/settings`

Speichert technische SoundAlerts-Settings in `soundalerts_bridge_settings`.

Akzeptiert flache Keys wie:

```json
{
  "soundSystem.defaultCategory": "channel_reward",
  "upload.maxVideoSizeBytes": 524288000
}
```

oder Body mit `settings`:

```json
{
  "settings": {
    "upload.maxVideoSizeBytes": 524288000
  }
}
```

### GET `/api/soundalerts/config`

Bleibt kompatibel und liefert zusaetzlich:

- `settingsTable`
- `settingsSource`

### POST `/api/soundalerts/config`

Bleibt kompatibel.

Aenderungen an technischen Config-Werten werden zusaetzlich in `soundalerts_bridge_settings` gespeichert.

`rules` werden weiterhin wie in STEP192.1 in `soundalerts_bridge_entries` gespeichert.

## Dashboardfaehige Settings in diesem STEP

- `enabled`
- `bot.login`
- `bot.userId`
- `bot.displayName`
- `bot.validateUserinfo`
- `parser.language`
- `parser.allowQuotedSoundNames`
- `parser.allowUnquotedSoundNames`
- `soundSystem.playUrl`
- `soundSystem.soundsBaseDir`
- `soundSystem.allowedExtensions`
- `soundSystem.defaultCategory`
- `soundSystem.defaultPriority`
- `soundSystem.audioOutputTarget`
- `soundSystem.videoOutputTarget`
- `soundSystem.defaultVolume`
- `upload.enabled`
- `upload.audioDir`
- `upload.videoDir`
- `upload.audioRelativePrefix`
- `upload.videoRelativePrefix`
- `upload.allowOverwrite`
- `upload.maxAudioSizeBytes`
- `upload.maxVideoSizeBytes`
- `upload.allowedAudioExtensions`
- `upload.allowedVideoExtensions`
- `chatMessages.enabled`
- `chatMessages.onMissingFile`
- `chatMessages.onUnmatched`
- `chatMessages.cooldownMs`
- `chatMessages.missingFileTemplate`
- `dedupe.enabled`
- `dedupe.windowMs`

## Bewusste Normalisierung

`soundSystem.defaultCategory` wird bei leerem Wert oder altem Wert `soundalerts` auf `channel_reward` normalisiert.

Grund:

Normale SoundAlerts sollen fachlich als Channel-Reward-Sound laufen. Der getestete Eintrag `fahrstuhl_sound` nutzt bereits korrekt `channel_reward`.

## Nicht geaendert

- Keine bestehende SoundAlerts-Entry-Logik entfernt.
- Keine bestehende Events-/Stats-Logik entfernt.
- Keine Upload-Logik entfernt.
- Keine Chat-Parser-Logik entfernt.
- Keine Twitch-/WebSocket-Logik entfernt.
- Keine SQLite-Datei veraendert oder mitgeliefert.
- Keine Secrets oder `.env` betroffen.
- JSON-Fallback bleibt bestehen.

## Syntaxcheck

Vor Lieferung lokal geprueft:

```powershell
node -c backend/modules/soundalerts_bridge.js
```

Ergebnis:

```text
OK
```

## Test nach Entpacken / Deploy

Nach ZIP-Entpacken nach `D:\Git\stream-control-center`:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "feat: store soundalerts settings in db"
```

Danach Live pruefen:

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/settings" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/entries" | ConvertTo-Json -Depth 30
```

Erwartung:

- `version = 0.1.4`
- `database.settingsTable = soundalerts_bridge_settings`
- `database.settingsStats.ok = true`
- `config.soundSystem.defaultCategory = channel_reward`
- Entries bleiben `source = db`
- `fahrstuhl_sound` bleibt aktiv und unveraendert korrekt

Optional Upload-Limit testen/setzen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/settings" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"settings":{"upload.maxVideoSizeBytes":524288000}}' | ConvertTo-Json -Depth 30
```

Danach erneut Status pruefen.

## Naechster sinnvoller STEP

STEP193 - SoundAlerts Inbox / Auto Entries

Ziel:

Wenn ein SoundAlerts-Chateintrag kommt, der noch keinen DB-Eintrag hat:

- automatisch DB-Eintrag als `new_detected` erstellen
- wenn Datei fehlt: `missing_file`
- wenn Datei vorhanden: `file_matched` / `ready`
- Dashboard zeigt neue erkannte SoundAlerts direkt sichtbar an
- Datei aus dem Eintrag heraus hochladen/zuweisen
