# Commands-Modul – Stand STEP218 / LWG-5.10

## Live-Basis

```text
backend/modules/commands.js
MODULE_VERSION = 0.2.2
MODULE_BUILD   = LWG_5_6_COMMAND_RESULT_CHAT_SEND_BRIDGE
```

## Zentrale Chat-Ausgabe

Das Commands-Modul kann Modul-Ergebnisse zentral in den Twitch-Chat senden, wenn der Command entsprechend konfiguriert ist:

```text
config.sendResultToChat = true
config.resultChatTarget = twitch_presence
```

Ablauf:

```text
Command erkannt
→ Zielmodul per targetUrl ausführen
→ result.data.message auslesen
→ twitch_presence.sendChatMessage(...)
→ chatReply im command_execution_log speichern
```

## Aktive Commands

```text
!punkte / !points         everyone, aktiv
!givepoints @user amount  mod, aktiv
!setpoint @user balance   streamer/owner, aktiv
```

## Bestätigte Rechteprüfung

```text
Viewer → !givepoints        permission_denied
Mod    → !setpoint          permission_denied
Mod    → !givepoints        erlaubt
Owner  → !setpoint          erlaubt
```

## Bestätigter Live-Test

```text
presence send count    before=0, after=2
logs contain chatReply giveLog=True, setLog=True
```

Damit ist die zentrale Command-zu-Chat-Kette für Loyalty-Admin-Commands bestätigt.
