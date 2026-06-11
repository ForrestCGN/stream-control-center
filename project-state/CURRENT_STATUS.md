# CURRENT_STATUS

Stand: 2026-06-11  
Aktueller Stand: STEP216 / LWG-5.8

## Bestätigt vor STEP216

```text
!punkte / !points läuft live über Node und antwortet im Twitch-Chat.
commands.js 0.2.2 / LWG_5_6_COMMAND_RESULT_CHAT_SEND_BRIDGE ist live.
twitch_presence sendet Command-Result-Antworten.
```

## STEP216-Umfang

```text
Admin-Points Runtime kontrolliert testen.
Keine Runtime-Codeänderung.
Keine neue Command-Aktivierung.
Keine DB-Datei im Paket.
```

## Aktiv

```text
!punkte
!points
```

## Weiterhin nicht als eigener Command aktiv

```text
!givepoints
!setpoint
!gamble
!duell
!raffle
!roulette
```

## Admin-Subcommands unter punkte

```text
!punkte give @user <amount>  → Mod/Broadcaster
!punkte set @user <balance> → Broadcaster
```

Diese Logik wird in STEP216 getestet.
