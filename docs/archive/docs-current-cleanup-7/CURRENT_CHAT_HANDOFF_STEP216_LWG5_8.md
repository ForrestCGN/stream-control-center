# CURRENT CHAT HANDOFF – STEP216 / LWG-5.8

Stand: 2026-06-11

## Kurzstatus

STEP215 hat den Live-Stand von `!punkte / !points` dokumentiert. STEP216 bereitet den kontrollierten Admin-Points-Test vor.

## Vorher bestätigt

```text
Twitch Chat
→ EventBus
→ commands.js
→ loyalty runtime
→ result.message
→ twitch_presence.sendChatMessage(...)
→ Twitch-Chat Antwort
```

## STEP216-Ziel

Admin-Punkte kontrolliert testen, ohne neue Commands live freizuschalten:

```text
!punkte give @step216_testuser 3
!punkte set @step216_testuser 0
```

Technisch wird direkt `/api/loyalty/runtime/points-command` genutzt, damit der Test keine Chat-Ausgaben verursacht.

## Testscript

```text
Test_STEP216_LWG5_8_admin_points_runtime_ForrestCGN.ps1
```

Ausführung echter Test:

```powershell
powershell -ExecutionPolicy Bypass -File .\Test_STEP216_LWG5_8_admin_points_runtime_ForrestCGN.ps1 -Execute
```

## Rollback

```powershell
powershell -ExecutionPolicy Bypass -File .\Rollback_STEP216_LWG5_8_admin_points_testuser_ForrestCGN.ps1
```

## Danach

Wenn STEP216 bestätigt ist, kann STEP217 als kontrollierter Gamble-Test vorbereitet werden.
