# STEP463_SHOUTOUT_CHAT_MESSAGE_CLEANUP_TEST_MODE

## Ziel

Die Shoutout-Testmeldungen im Chat werden auf das Nötigste reduziert, damit der VSO-Test nicht mehr durch Meldungen des offiziellen Twitch-Shoutout-Folgeprozesses verwirrt wird.

## Runtime

- Modul: `clip_shoutout`
- Runtime-Version: `0.2.6`
- Test-Command bleibt: `!vso`

## Geändert

- Erste Annahme: `✅ Shoutout für @{displayName} aufgenommen.`
- Weitere Annahme bei aktiver Anzeige, Cooldown oder Queue: `⏳ Shoutout für @{displayName} aufgenommen und in die Warteschlange gesetzt.`
- Chatmeldungen für offiziellen Twitch-Shoutout werden stummgeschaltet.

## Nicht geändert

- Display-Queue bleibt aktiv.
- 2-Minuten-Abstand startet weiterhin nach Ende der Anzeige.
- Offizielle Twitch-Shoutout-Queue bleibt technisch aktiv.
- Event-Bus bleibt aktiv.
- `!so` wird noch nicht aktiviert.

## Test

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object module,moduleVersion,enabled,command,officialChatMessagesMuted
```

Erwartung:

```text
clip_shoutout 0.2.6 True vso True
```

Chat-Test:

```text
!vso @urlug
!vso @bynexl
!vso @weiterer
```

Erwartung:

- erster VSO: kurze Aufgenommen-Meldung
- jeder weitere VSO: Aufgenommen + Warteschlange
- keine offiziellen Twitch-Shoutout-Chatmeldungen
