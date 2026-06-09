# Changelog

## AUTOSHOUT-HOTFIX.1 – 2026-06-09

### Behoben

- AutoShout-Livepfad brach mit `autoRawMessage is not defined` ab.
- Dadurch wurden Chatnachrichten zwar von Twitch-Presence gesehen, aber AutoShout konnte weder `recentActivity` noch `recentEvents` fortschreiben.
- Minimal-Fix: `autoRawMessage` und `instantTrigger` werden im Livepfad von `handleAutoShoutoutChatActivity` gesetzt.

### Bestätigte Tests

- `lastError` nach Neustart leer.
- 2-Nachrichten-Regel triggert wieder.
- `!lurk` als erste Nachricht triggert wieder trotz `minMessagesBeforeTrigger = 2`.

### Nicht geändert

- keine Queue-Logik geändert
- keine OfficialQueue-Logik geändert
- keine Twitch-Presence-Logik geändert
- keine Streamer.bot-Logik geändert
- keine DB-Datei ersetzt

## LWG-4N.7

- Claim/Spin auf Giveaway-Bound-Wheel-Felder umgestellt.
- Source-Preset für Bound-Wheel-Runtime optional gemacht.
- Bound-Wheel-Feldmenge wird nach Gewinn reduziert, wenn begrenzte Menge gesetzt ist.
