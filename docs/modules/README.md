# Modul-Dokus

Stand: 2026-05-26 / STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE

Diese Uebersicht verweist auf die Modul-Dokus. Sie sind Arbeitsgrundlage, ersetzen aber keine erneute Pruefung echter Dateien vor Aenderungen.

## Wichtige Dokus

- [`channelpoints-deep-dive.md`](./channelpoints-deep-dive.md)
- [`core-communication-bus.md`](./core-communication-bus.md)
- [`core-stream-status.md`](./core-stream-status.md)
- [`core-database-sqlite.md`](./core-database-sqlite.md)
- [`core-security-audit.md`](./core-security-audit.md)
- [`helpers-overview.md`](./helpers-overview.md)
- [`helper-config-core.md`](./helper-config-core.md)
- [`helper-texts-settings.md`](./helper-texts-settings.md)
- [`helper-media-chat-twitch.md`](./helper-media-chat-twitch.md)
- [`clip-shoutout-vso-deep-dive.md`](./clip-shoutout-vso-deep-dive.md)
- [`alerts-deep-dive.md`](./alerts-deep-dive.md)
- [`sound-system-deep-dive.md`](./sound-system-deep-dive.md)
- [`vip-sound-overlay-deep-dive.md`](./vip-sound-overlay-deep-dive.md)
- [`clips-deep-dive.md`](./clips-deep-dive.md)
- [`tts-system-deep-dive.md`](./tts-system-deep-dive.md)
- [`twitch-deep-dive.md`](./twitch-deep-dive.md)
- [`discord-deep-dive.md`](./discord-deep-dive.md)
- [`obs-deep-dive.md`](./obs-deep-dive.md)
- [`scene-control-deep-dive.md`](./scene-control-deep-dive.md)
- [`tagebuch-deep-dive.md`](./tagebuch-deep-dive.md)
- [`todo-deep-dive.md`](./todo-deep-dive.md)
- [`message-rotator-deep-dive.md`](./message-rotator-deep-dive.md)
- [`hug-deep-dive.md`](./hug-deep-dive.md)
- [`birthday-deep-dive.md`](./birthday-deep-dive.md)
- [`commands-deep-dive.md`](./commands-deep-dive.md)
- [`commands-media-deep-dive.md`](./commands-media-deep-dive.md)
- [`bus-diagnostics-deep-dive.md`](./bus-diagnostics-deep-dive.md)

## STEP491 Hinweis

`channelpoints.js` bietet ab STEP491 eine Schema-Vorschau ueber:

```text
GET /api/channelpoints/schema-preview
```

Diese Route darf keine DB-Schreiboperation ausfuehren.

## Pflegepflicht

Vor Aenderungen an einem Modul:

```text
1. passende docs/modules/<modul>.md lesen
2. echte Moduldateien pruefen
3. Routen, Funktionen, Configs, DB-Tabellen, Events, Dashboard-/Overlay-Bezuege aktualisieren
4. offene Punkte in TODO.md/NEXT_STEPS.md nachziehen
5. docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_*.md aktualisieren
```

Neue oder angefasste Module sollen klare Versionsnummern nutzen (`version` oder `moduleVersion`).


## STEP492 Hinweis

Das Kanalpunkte-Modul besitzt jetzt eine sichere lokale DB-Grundlage. Migrationen bleiben additiv; Twitch-Schreibaktionen sind weiterhin nicht Bestandteil dieses Steps.
