# STEP616_COMMAND_SYSTEM_CHANNEL_GUARD

Stand: 2026-05-31

## Ziel

Das Command-System soll nur noch auf Twitch-Chatnachrichten reagieren, die wirklich an den eigenen Bot-/Streamer-Channel gerichtet sind.

Ausloeser war ein Stream-Together-/Shared-Chat-Fall, bei dem im anderen Chat `!rip` geschrieben wurde und unser Command-System darauf reagiert hat.

## Betroffene Datei

```text
backend/modules/commands.js
```

## Geaendert

- `commands.js` von `0.1.5` auf `0.1.6` erhoeht.
- `MODULE_BUILD` auf `channel-guard` gesetzt.
- Neue Helper-Funktion `cleanChannel(value)` ergaenzt.
- `handleChatMessage(parsed, source)` prueft jetzt vor der Command-Ausfuehrung:
  - erwarteter Channel aus `source.channel` oder `TWITCH_BOT_CHANNEL`
  - eingehender Message-Channel aus `parsed.params[0]`
- Wenn der Zielchannel fehlt, wird die Nachricht ignoriert mit `reason: "channel_missing"`.
- Wenn der Zielchannel nicht dem erwarteten Channel entspricht, wird die Nachricht ignoriert mit `reason: "channel_mismatch"`.
- `/api/commands/status` enthaelt jetzt `commandChannelGuard` als kompakten Statushinweis.
- Console-Startmeldung zeigt den neuen Build-Hinweis `channel guard`.

## Bewusst nicht geaendert

- Keine Command-Definitionen geaendert.
- Keine `!rip`-/Deathcounter-Logik geaendert.
- Keine Dashboard-Dateien geaendert.
- Kein EventBus-Umbau.
- Kein Sound-System-Umbau.
- Keine Datenbank-Migration.

## Technischer Guard

Der Guard sitzt zentral in `handleChatMessage`, damit alle Twitch-Chat-Commands geschuetzt sind und nicht einzelne Commands separat gefiltert werden muessen.

Relevante Logik:

```js
const expectedChannel = cleanChannel(source.channel || process.env.TWITCH_BOT_CHANNEL || '');
const messageChannel = cleanChannel(parsed.params?.[0] || parsed.channel || '');

if (expectedChannel && !messageChannel) {
  state.ignored += 1;
  return { ok: true, ignored: true, reason: 'channel_missing', expectedChannel };
}

if (expectedChannel && messageChannel && messageChannel !== expectedChannel) {
  state.ignored += 1;
  return { ok: true, ignored: true, reason: 'channel_mismatch', channel: messageChannel, expectedChannel };
}
```

## Tests

Syntaxcheck:

```bat
node --check backend\modules\commands.js
```

Statuscheck nach Deploy/Backend-Neustart:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,enabled,lastError
```

Erwartung:

```text
moduleVersion = 0.1.6
moduleBuild   = channel-guard
```

Guard-Status:

```powershell
$s.commandChannelGuard
```

Erwartung:

```text
enabled = True
expectedChannel = forrestcgn oder dein gesetzter TWITCH_BOT_CHANNEL
mismatchReason = channel_mismatch
```

## Live-Pruefung

- Im eigenen Chat `!rip` testen: Command soll weiterhin funktionieren.
- In Stream-Together/fremdem Chat `!rip` testen: unser System darf nicht reagieren.

## Offene Punkte

Falls Twitch bei Stream Together zusaetzliche Shared-Chat-Tags sendet und trotz Channel-Guard weiterhin Fremdchat-Kommandos durchkommen, muessen die echten Raw-IRC-Tags eines solchen Events geloggt und separat ausgewertet werden. Dieser STEP baut bewusst nur die erste saubere Schutzschicht ueber den Zielchannel.
