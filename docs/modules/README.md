# Modul-Dokus

Stand: 2026-05-26 / STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN

Diese Übersicht verweist auf die Modul-Dokus. Sie sind Arbeitsgrundlage, ersetzen aber keine erneute Prüfung echter Dateien vor Änderungen.

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

## STEP490 Hinweis

Das Kanalpunkte-System ist als neues Fachmodul dokumentiert.

Wichtige Regel:

```text
Medien/Uploads für Kanalpunkte laufen über das bestehende Media-System und die vorhandene Upload-Maske.
```

Keine zweite Upload-Struktur bauen.

## STEP488 Hinweis

Der Modul-zu-Modul-Contract wurde in `backend/modules/helpers/helper_communication.js` integriert.

Keine dauerhafte zweite Bus-/Contract-Helper-Datei als Zielarchitektur verwenden.

Wenn `helper_communication_contract.js` aus STEP487 bereits lokal oder live vorhanden ist, soll diese Datei wieder entfernt werden.

## Pflegepflicht

Vor Änderungen an einem Modul:

```text
1. passende docs/modules/<modul>.md lesen
2. echte Moduldateien prüfen
3. Routen, Funktionen, Configs, DB-Tabellen, Events, Dashboard-/Overlay-Bezüge aktualisieren
4. offene Punkte in TODO.md/NEXT_STEPS.md nachziehen
5. docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_*.md aktualisieren
```

Neue oder angefasste Module sollen klare Versionsnummern nutzen (`version` oder `moduleVersion`).
