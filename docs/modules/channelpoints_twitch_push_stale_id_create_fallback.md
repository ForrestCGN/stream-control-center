# STEP510 – Channelpoints Twitch Push Stale ID Create Fallback

## Ziel

Dieser Step korrigiert die einfache Twitch-Push-Logik für lokale Rewards, deren gespeicherte `twitch_reward_id` auf Twitch nicht mehr existiert.

## Problem

Wenn lokal eine `twitch_reward_id` vorhanden war, hat STEP509 immer ein PATCH auf diese ID versucht. Wenn Twitch mit `The custom reward specified in the id query parameter was not found.` antwortet, wurde trotz `createIfMissing:true` kein neuer Reward erstellt.

## Neue Regel

- Lokale `twitch_reward_id` vorhanden: zuerst PATCH versuchen.
- Wenn Twitch meldet, dass diese Reward-ID nicht gefunden wurde:
  - lokale `twitch_reward_id` entfernen,
  - `twitch_is_enabled` lokal zurücksetzen,
  - bei `createIfMissing:true` per POST neu auf Twitch erstellen,
  - neue Twitch-ID lokal speichern.
- Bei Client-ID-/Ownership-Fehlern kein Fallback. Solche Rewards dürfen nicht überschrieben werden.

## Sicherheit

- Kein neuer Modus.
- Keine neue Tabelle.
- Keine DB-Migration.
- Weiterhin nur zentrale `../core/database`-Nutzung.
- Twitch-Write nur mit `channel:manage:redemptions`.
- Push weiterhin nur mit Bestätigung `confirm: "push_to_twitch"`.

## Geänderte Datei

- `backend/modules/channelpoints.js`

## Version

- Backend: `0.9.0`
- Build: `twitch-push-stale-id-create-fallback`
