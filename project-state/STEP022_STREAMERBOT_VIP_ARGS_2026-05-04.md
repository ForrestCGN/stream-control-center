# STEP022 - Streamer.bot VIP-Argumente geprueft

Stand: 2026-05-04

## Ziel

Pruefen, ob Streamer.bot 1.0.4 bei echten Twitch-Chat-Commands die Felder liefert, die das VIP-Backend fuer Actor, Target und Override-Rechte braucht.

## Ergebnis

Kein Code-Fix erforderlich.

Die echten Streamer.bot-Argumente passen zum aktuellen VIP-Modul.

## Gepruefte relevante Felder

Bei einem normalen Command ohne Target wurden relevante Actor-Felder geliefert:

- `command`
- `commandSource`
- `commandType`
- `rawInput`
- `input.count`
- `input0`
- `user`
- `userName`
- `userType`
- `isModerator`
- `isVip`

Bei einem Command mit Target wurden zusaetzlich relevante Target-Felder geliefert:

- `rawInput` enthaelt die Eingabe mit Mention.
- `input0` enthaelt den Target-Login ohne Mention-Zeichen.

## Bewertung fuer VIP-Modul

Actor-Erkennung passt:

- `userName` kann als Actor-Login genutzt werden.
- `user` kann als Actor-DisplayName genutzt werden.

Target-Erkennung passt:

- `input0` liefert den Target-Login ohne Mention-Zeichen.
- `rawInput` enthaelt die rohe Eingabe.

Override-Erkennung passt:

- Streamer.bot liefert `isModerator`.
- Das VIP-Modul prueft bereits `isModerator` in `actorCanOverride()`.
- Damit ist fuer Broadcaster/Moderator-aehnliche Nutzung keine Erweiterung noetig.

## Betroffene Dateien

Keine Code-Datei geaendert.

Nur Dokumentation:

- `project-state/STEP022_STREAMERBOT_VIP_ARGS_2026-05-04.md`
- `project-state/CHANGELOG.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## Bewusst offen

- Optional spaeter einen echten Mod-Account testen, um zu bestaetigen, dass Mods ebenfalls `isModerator = True` liefern.
- Danach Debug-Action/Command `!vipdebug` in Streamer.bot wieder entfernen oder deaktivieren.

## Sicherheit / Regeln

- Keine Funktionalitaet entfernt.
- Keine SQLite-Datei committed oder ersetzt.
- Keine Secrets, `.env`, Tokens, Backups oder temporaeren Dateien committed.
