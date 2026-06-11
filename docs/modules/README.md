# Module-Dokumentation

Stand: 2026-06-11

## Aktueller Bereich

```text
STEP216 / LWG-5.8 – Admin-Points kontrollierter Runtime-Test
```

## Relevante Module

```text
commands
loyalty
twitch_presence
loyalty_games
```

## Bestätigte Basis vor STEP216

```text
!punkte / !points läuft live über Node und sendet Antworten zentral über twitch_presence.
commands.js = 0.2.2 / LWG_5_6_COMMAND_RESULT_CHAT_SEND_BRIDGE
loyalty.js  = 0.1.13 / STEP210 Status Cleanup
```

## STEP216-Ziel

Kontrolliert prüfen, dass Admin-Punkte über die vorhandene Loyalty-Runtime funktionieren:

```text
!punkte give @user <amount>  → Mod/Broadcaster
!punkte set @user <balance> → nur Broadcaster
```

Der STEP aktiviert keine zusätzlichen Live-Commands und verändert keine Runtime-Dateien.
