# CURRENT STATUS – stream-control-center Loyalty

Stand: 2026-06-11 / STEP218 LWG-5.10

## Live bestätigt

```text
commands.js 0.2.2 / LWG_5_6_COMMAND_RESULT_CHAT_SEND_BRIDGE
loyalty.js  0.1.13 / shadow mode
twitch_presence connected/joined für Chat-Ausgabe bestätigt
```

## Aktive Commands

```text
!punkte / !points         aktiv, everyone
!givepoints @user amount  aktiv, mod
!setpoint @user balance   aktiv, streamer/owner
```

## Deaktiviert

```text
!gamble
```

## Bestätigte Tests

```text
STEP214: Command Result Chat Send Bridge live bestätigt
STEP216: Admin-Points Runtime kontrolliert bestätigt
STEP217: Admin-Points Chat-Commands mit Chat-Antwort + Restore bestätigt
```

## Letzter bestätigter Test

```text
TargetLogin: step217_testuser
Amount: 4
mod !givepoints            ok=True, sent=True, balance=4, available=4
streamer !setpoint restore ok=True, sent=True, balance=0, available=0
final unchanged            balance=0, available=0, reserved=0
presence send count        before=0, after=2
logs contain chatReply     giveLog=True, setLog=True
transaction audit          recentAdminTransactions=2
```

## Hinweise

- StreamElements `!points` / `!punkte` deaktiviert halten.
- Admin-Testtransaktionen bleiben absichtlich in der Historie.
- Nächster Entwicklungsbereich: Gamble separat planen/freigeben.
