# STEP239 - DeathCounter Chat-Output-Anbindung

Stand: 2026-05-11

## Ziel

DeathCounter-Command-Antworten sollen primaer vom Backend ueber den vorhandenen Chat-Output-Helper/Bot gesendet werden. Streamer.bot bleibt nur Uebergabe- und Fallback-Schicht.

## Geaendert

```text
backend/modules/deathcounter_v2.js
```

## Umsetzung

- `backend/modules/deathcounter_v2.js` nutzt jetzt `./helpers/helper_chat_output`.
- Command-Antworten mit `streamerbot_send = "1"` werden ueber `chatOutput.sendChatMessage()` gesendet.
- Bei erfolgreichem Direktversand setzt die API `chat_sent = true` und `streamerbot_send = "0"`.
- Wenn der direkte Chatversand nicht klappt und `fallbackToStreamerbot` aktiv ist, bleibt `streamerbot_send = "1"` mit `streamerbot_message` erhalten.
- Stille Aktionen wie `!rip @user`, `!rip @user del`, `!dcount show/hide/toggle/reset/replace` bleiben ohne Chat-Ausgabe.
- `!tode`, `!tode @user` und Fehlermeldungen werden primaer durch das Backend gesendet.
- Fuer manuelle API-Tests kann Backend-Chatversand mit `sendChat=0` oder `chatOutput=0` uebersprungen werden.

## Bewusst nicht geaendert

```text
- keine DB-Migration
- keine Aenderung an app.sqlite
- keine Dashboard-Dateien
- keine Overlay-Dateien
- keine Streamer.bot-Actions
- keine Entfernung alter Routen
- keine Textvarianten-Umstellung
```

## Testempfehlung

Ohne echten Chatversand testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=ForrestCGN&requireMention=1&sendChat=0" | ConvertTo-Json -Depth 20
```

Mit Backend-Chatversand testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode&input0=@ForrestCGN&requireMention=1" | ConvertTo-Json -Depth 20
```

Erwartung bei funktionierendem Bot-Chat:

```text
chat_output_attempted = true
chat_sent = true
streamerbot_send = "0"
```

Erwartung bei Fallback:

```text
chat_output_attempted = true
chat_sent = false
streamerbot_send = "1"
streamerbot_message enthaelt die Chatnachricht
```

## Naechster Schritt

STEP240: DeathCounter Settings ueber `helper_settings` und DB vorbereiten. Dabei sollen u. a. `requireMention`, `chatOutputMode`, `fallbackToStreamerbot`, AutoCreate, TwitchLookup, Default-Spieler und Streamstart-Verhalten dashboardfaehig werden.
