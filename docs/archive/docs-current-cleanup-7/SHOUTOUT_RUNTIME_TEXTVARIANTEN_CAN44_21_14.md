# CAN-44.21.14 – Shoutout Runtime auf Textvarianten umstellen

## Ausgangslage

Die Textdatenbank ist sauber befüllt:

- 15 Text-Keys
- pro Key 5 aktive Varianten
- alte Seed-Texte deaktiviert

Beim Live-Test kam aber noch:

```text
✅ Shoutout für @lostreapy aufgenommen.
```

Damit war klar: Die Runtime nutzt an dieser Stelle noch die alte Config/Fallback-Message.

## Ziel dieses Steps

`backend/modules/clip_shoutout.js` wird so angepasst, dass Chatmeldungen zuerst die neuen Textvarianten nutzen:

- `shoutout.chat.accepted`
- `shoutout.chat.waiting`
- `shoutout.chat.duplicate`
- `shoutout.auto.queued`
- `shoutout.auto.alreadyQueued`
- `shoutout.auto.waitingStartScene`
- `shoutout.official.queued`

Fallbacks bleiben erhalten. Wenn ein Text-Key fehlt oder leer ist, nutzt das System weiterhin die alte Config-Nachricht.

## Geänderte Runtime-Pfade

- Manueller Shouti: angenommen/wartend/duplicate
- AutoShouti: queued/alreadyQueued/waitingStartScene usw.
- Offizieller Twitch-Shoutout: queued-Meldung
- Seed-Defaults im Code auf CGN-Altersheimkino-Stil aktualisiert
- Modulversion: `0.2.26`

## Anwendung

```powershell
cd D:\Git\stream-control-center
node .\tools\apply_can_44_21_14_shoutout_runtime_texts.js
```

Danach Backend neu starten.

## Prüfung

```powershell
node -c .\backend\modules\clip_shoutout.js
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status" | ConvertTo-Json -Depth 20
```

Danach im Chat:

```text
!so @testkanal
```

Erwartung: Die Chatmeldung kommt zufällig aus den neuen `shoutout.chat.accepted`-Varianten.
