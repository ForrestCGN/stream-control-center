# STEP223 - Alert-TTS Cheer-Wort Cleanup

Stand: 2026-05-11

## Ziel

Twitch-Cheer-Worts wie `Cheer100`, `Cheer10 Cheer10 Cheer100` sollen nicht mehr per Alert-TTS vorgelesen werden.

## Geaendert

```text
backend/modules/alert_system.js
```

## Umsetzung

- TTS-Text wird vor dem Aufruf von `/api/tts/prepare-alert` bereinigt.
- Die Bereinigung greift nur fuer Twitch-Bits-Alerts (`type_key=bits`, `source=twitch` bzw. `provider=twitch_eventsub`/`eventsubType=channel.cheer`).
- Standalone-Cheer-Worts im Format `Cheer` + Zahl werden aus dem TTS-Text entfernt.
- Die originale Alert-Message bleibt unveraendert gespeichert und sichtbar.

## Beispiele

```text
Cheer100
-> kein TTS

Cheer100 test
-> test

Cheer10 Cheer10 Cheer100 test
-> test
```

## Bewusst nicht geaendert

```text
backend/modules/twitch.js
Alert-Regeln
Alert-Queue
Sound-System
Dashboard
Datenbank-Schema
app.sqlite
Loyalty
Kofi/Tipeee
```

## Tests

Syntaxcheck:

```powershell
node --check backend/modules/alert_system.js
```

Dry-Run/Live-Test erfolgt ueber den Twitch EventSub Debug-Simulator aus STEP221 und die Alert-Event-History.
