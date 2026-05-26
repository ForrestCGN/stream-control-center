# Modul-Dokus

Stand: 2026-05-26 / STEP489_CHANNELPOINTS_BACKEND_SKELETON

Diese Uebersicht verweist auf die Modul-Dokus. Sie sind Arbeitsgrundlage, ersetzen aber keine erneute Pruefung echter Dateien vor Aenderungen.

## Wichtige Dokus

- [`core-communication-bus.md`](./core-communication-bus.md)
- [`core-stream-status.md`](./core-stream-status.md)
- [`core-database-sqlite.md`](./core-database-sqlite.md)
- [`core-security-audit.md`](./core-security-audit.md)
- [`helpers-overview.md`](./helpers-overview.md)
- [`helper-config-core.md`](./helper-config-core.md)
- [`helper-texts-settings.md`](./helper-texts-settings.md)
- [`helper-media-chat-twitch.md`](./helper-media-chat-twitch.md)
- [`channelpoints-deep-dive.md`](./channelpoints-deep-dive.md)
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

## STEP488 Hinweis

Der Modul-zu-Modul-Contract wurde in `backend/modules/helpers/helper_communication.js` integriert.

Keine dauerhafte zweite Bus-/Contract-Helper-Datei als Zielarchitektur verwenden.

Wenn `helper_communication_contract.js` aus STEP487 bereits lokal entpackt wurde, soll diese Datei wieder entfernt werden, bevor weitergebaut wird.

## STEP489 Hinweis

`backend/modules/channelpoints.js` ist ab STEP489 als neues Fachmodul vorhanden.

Das Modul ist aktuell ein sicheres Backend-Skelett:

```text
moduleVersion 0.1.0
/api/channelpoints/status
/api/channelpoints/bus-test
Bus-Registrierung ueber registerModule
Status/Heartbeat ueber publishModuleStatus/heartbeatModule
keine Twitch-Schreibaktionen
keine DB-Migration
kein Dashboard-Umbau
```

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
