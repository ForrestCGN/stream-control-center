# STEP240 - DeathCounter DB-Settings

Stand: 2026-05-11

## Ziel

DeathCounter V2 nutzt jetzt fuer steuerbare Runtime-Optionen eine eigene DB-Settings-Tabelle ueber den vorhandenen `helper_settings`.

## Geaendert

```text
backend/modules/deathcounter_v2.js
```

## Neue/erweiterte API

```text
GET  /api/deathcounter/v2/admin/settings
POST /api/deathcounter/v2/admin/settings
GET  /api/deathcounter/v2/settings
GET  /api/deathcounter/v2/integration-check
```

## Neue Settings-Tabelle

```text
deathcounter_settings
```

Die Tabelle wird sanft ueber `helper_settings.seedDefaults()` erzeugt/gefuehlt. Es wird keine bestehende Datenbank ersetzt und keine DeathCounter-Count-Daten migriert.

## Aktuelle Default-Settings

```text
requireMentionForPlayerCommands = true
chatOutputEnabled = true
fallbackToStreamerbot = true
fallbackToStreamer = true
chatOutputPrefer = bot
directSendEnabled = true
autoCreatePlayers = true
allowTwitchLookup = true
defaultSelectedIds = ["forrestcgn", "engelcgn"]
maxExtraPlayers = 2
resetSessionOnStreamStart = true
resetOverlayPlayersOnStreamStart = true
```

## Wirkung

- `requireMentionForPlayerCommands` ist jetzt DB-Setting und standardmaessig aktiv.
- Spieler-Commands wie `!rip ForrestCGN` werden ohne `@` blockiert.
- `!tode` ohne Spieler bleibt erlaubt.
- Chat-Ausgabe wird weiterhin primaer ueber `helper_chat_output` gesendet.
- `fallbackToStreamerbot` bleibt erhalten, wenn Backend-Chatversand fehlschlaegt.
- AutoCreate und TwitchLookup fuer neue RIP-Spieler sind steuerbar.
- Streamstart-Verhalten fuer Session-Reset und Overlay-Spieler-Reset ist steuerbar.
- `defaultSelectedIds` und `maxExtraPlayers` werden fuer Overlay-Auswahl/Normalisierung beruecksichtigt.

## Bewusst nicht geaendert

```text
- keine Migration der DeathCounter-Counts in DB
- keine Aenderung an app.sqlite-Datei selbst im ZIP
- keine Dashboard-Dateien
- keine Overlay-Dateien
- keine Streamer.bot-Actions
- keine Entfernung bestehender Routen
- JSON-State bleibt produktive Count-/State-Quelle
```

## Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/admin/settings" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/settings" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=ForrestCGN&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=@ForrestCGN&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=@ForrestCGN&input1=del&sendChat=0" | ConvertTo-Json -Depth 20
```

## Beispiel Settings speichern

```powershell
$body = @{ settings = @{ requireMentionForPlayerCommands = $true; chatOutputEnabled = $true; fallbackToStreamerbot = $true } } | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/admin/settings" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 30
```

## Naechster sinnvoller STEP

STEP241: DeathCounter Textvarianten ueber `module_text_variants`, damit Fehlermeldungen und Chat-Ausgaben nicht mehr hart im Code liegen.
