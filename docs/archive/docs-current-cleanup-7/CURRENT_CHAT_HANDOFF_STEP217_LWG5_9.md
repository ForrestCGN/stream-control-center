# CURRENT CHAT HANDOFF – STEP217 / LWG-5.9

Stand: 2026-06-11

## Bestätigter Vorlauf

```text
STEP214 / LWG-5.6: Command Result Chat Send Bridge live bestätigt
STEP216 / LWG-5.8: Admin-Points Runtime kontrolliert bestätigt
```

## Dieser STEP

STEP217 gibt die direkten Admin-Points-Chatcommands frei:

```text
!givepoints @user <amount>   → Mod/Streamer
!setpoint @user <balance>    → Streamer/Owner
```

Die Commands nutzen den vorhandenen Loyalty-Endpunkt:

```text
POST /api/loyalty/runtime/points-command
```

Chat-Ausgaben laufen weiter zentral über:

```text
commands.js → twitch_presence.sendChatMessage(...)
```

## Tests

Zuerst ohne Mutation:

```powershell
powershell -ExecutionPolicy Bypass -File .\Test_STEP217_LWG5_9_admin_points_chat_commands_ForrestCGN.ps1
```

Dann kontrolliert mit Mutation und Restore:

```powershell
powershell -ExecutionPolicy Bypass -File .\Test_STEP217_LWG5_9_admin_points_chat_commands_ForrestCGN.ps1 -Execute
```

## Rollback

Commands deaktivieren:

```powershell
powershell -ExecutionPolicy Bypass -File .\Rollback_STEP217_LWG5_9_admin_points_commands_ForrestCGN.ps1
```

Testuser zurücksetzen:

```powershell
powershell -ExecutionPolicy Bypass -File .\Rollback_STEP217_LWG5_9_admin_points_testuser_ForrestCGN.ps1
```

## Nächster sinnvoller Schritt

```text
STEP218 / LWG-6.0 – Gamble Command kontrolliert vorbereiten/freigeben
```
