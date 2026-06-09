# Ops-Hinweis – Shadow-Bridge später entfernen

Diese Datei beschreibt den späteren Rückbau von STEP LWG-4O.1.

Sobald `twitch_presence.js` selbst das Chat-Bus-Event `twitch.chat/message` erzeugt, soll folgende Datei aus dem Live-System und dem Repo entfernt werden:

```text
backend/modules/twitch_chat_bus_bridge.js
```

Vorher prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/chat-bus/status" | ConvertTo-Json -Depth 10
```

Nach der Zentralisierung sollte dieser Endpunkt nicht mehr benötigt werden. Die Statuswerte sollen dann im Twitch-Presence-Status erscheinen.
