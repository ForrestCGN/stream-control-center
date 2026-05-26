# Channelpoints-System Deep Dive

Stand: 2026-05-26 / STEP496

## Zweck

Lokale Grundlage für Twitch-Kanalpunkte-Rewards, später mit Twitch-Sync und Einlösungsverarbeitung.

## UX-Regel

Kanalpunkte und Commands sollen als verwandte Interaction-Systeme behandelt werden.

```text
Command = Textauslöser im Chat
Kanalpunkte = Button/Reward-Auslöser bei Twitch
```

Dashboard-Muster:

- Übersicht
- Rewards/Befehle
- Kategorien
- Aktionen
- Medien
- Einlösungen/Logs
- Sync/Diagnose

STEP496 hat die Commands optisch an dieses Muster angenähert. Kanalpunkte selbst bleibt auf STEP495-Funktionalität.
