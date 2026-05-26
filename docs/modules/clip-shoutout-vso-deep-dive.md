# Clip-Shoutout / VSO Deep Dive

> Stand: 2026-05-26 / STEP484. Quelle: aktuelle Dateien `backend/modules/clip_shoutout.js`, `backend/modules/twitch.js` und Dashboard-Dateien aus STEP483/STEP484. Vor weiteren Änderungen weiterhin echte Dateien prüfen.

## Zweck

`backend/modules/clip_shoutout.js` steuert das Video-/Clip-Shoutout-System. Es nimmt Chat-/API-Anfragen an, löst Zielkanäle auf, sucht Clips, verwaltet Display-Queue und Official-Twitch-Shoutout-Queue, führt Streamtag-Limits und Statistiken und speichert zusätzlich eingehende/erstellte Twitch-Shoutout-EventSub-Events.

## Datei und Version

| Punkt | Wert |
|---|---|
| Moduldatei | `backend/modules/clip_shoutout.js` |
| erkannte Modulversion | `0.2.11` |
| API-Prefix | `/api/clip-shoutout` |
| Legacy-API | `/api/clip/shoutout` |
| Twitch/EventSub-Quelle | `backend/modules/twitch.js` |
| Dashboard | `htdocs/dashboard/modules/shoutout.js`, `htdocs/dashboard/modules/shoutout.css` |

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/clip-shoutout/status` |
| `GET` | `/api/clip-shoutout/clips` |
| `GET` | `/api/clip-shoutout/run` |
| `POST` | `/api/clip-shoutout/run` |
| `GET` | `/api/clip/shoutout` |
| `POST` | `/api/clip/shoutout` |
| `GET` | `/api/clip-shoutout/settings` |
| `POST` | `/api/clip-shoutout/settings` |
| `GET` | `/api/clip-shoutout/queue` |
| `GET` | `/api/clip-shoutout/timeline` |
| `GET` | `/api/clip-shoutout/stats` |
| `GET` | `/api/clip-shoutout/stats/user` |
| `GET` | `/api/clip-shoutout/inbound` |
| `GET` | `/api/clip-shoutout/inbound/stats` |
| `POST` | `/api/clip-shoutout/inbound/debug` |
| `POST` | `/api/clip-shoutout/display-queue/remove` |
| `POST` | `/api/clip-shoutout/display-queue/retry` |
| `POST` | `/api/clip-shoutout/queue/remove` |
| `POST` | `/api/clip-shoutout/queue/retry` |
| `GET` | `/api/clip-shoutout/official/auth-status` |

## STEP484: Eingehende Shoutouts

Keine neue Twitch-/EventSub-Modulwelt wurde gebaut. Die Zuständigkeiten bleiben getrennt:

- `twitch.js` empfängt EventSub und erstellt/verwaltet Subscriptions.
- `clip_shoutout.js` speichert und wertet Shoutout-spezifische Events aus.

`backend/modules/twitch.js` ruft bei folgenden EventSub-Typen lazy `clip_shoutout.recordTwitchShoutoutEvent(...)` auf:

```text
channel.shoutout.receive
channel.shoutout.create
```

Gespeichert werden:

- Richtung: `incoming` oder `outgoing`,
- EventSub-Typ,
- Event-/Message-ID,
- Broadcaster-/From-/To-/Moderator-Daten,
- Viewer Count,
- Start-/Cooldown-Zeiten,
- Raw Event / Meta JSON.

## Hauptfunktionen / interne Bereiche

- Config: `loadConfig`, `shoutoutConfig`, `saveShoutoutConfig`, `displayConfig`, `streamDayLimitConfig`, `inboundShoutoutConfig`.
- Streamtag: `readCurrentStreamState`, `normalizeCentralStreamStatus`, `resolveCurrentStreamDay`.
- Display-Queue: `ensureDisplayQueueSchema`, `processDisplayQueue`, `runDisplayJob`, Queue-Listen/Retry/Remove.
- Official Twitch Shoutout: `ensureOfficialShoutoutSchema`, `sendOfficialTwitchShoutout`, `processOfficialShoutoutQueue`, History/Queue.
- Eingehende Shoutouts: `ensureInboundShoutoutSchema`, `recordTwitchShoutoutEvent`, `listInboundShoutoutEvents`, `buildInboundShoutoutStats`.
- Twitch/Clip-Auflösung: `getAppAccessToken`, `helixGet`, `listClipsForBroadcaster`, `lookupUserViaHelix`, `lookupUserViaLocalUserinfo`, `resolveTargetUser`, `resolveClipPlaybackUrl`.
- Clip-Vorbereitung: `downloadClipToSoundAssets`, `prepareClipPlayback`.
- Chat/EventBus: `sendChatMessage`, `getCommunicationBus`, `emitShoutoutBus`.

## Datenbanktabellen

| Tabelle | Zweck |
|---|---|
| `clip_shoutout_stream_days` | Streamtag-/Session-Zuordnung |
| `clip_shoutout_display_queue` | Anzeige-Queue |
| `clip_shoutout_official_queue` | Queue für offiziellen Twitch-Shoutout |
| `clip_shoutout_official_history` | Verlauf offizieller Twitch-Shoutouts |
| `clip_shoutout_inbound_events` | Eingehende und erstellte Twitch-Shoutout-EventSub-Events |
| `command_definitions` | Command-Registrierung |

## EventBus

Vorhandener Kanal:

```text
shoutout.system
```

Wichtige Actions:

```text
shoutout.display.queued
shoutout.display.waiting_cooldown
shoutout.display.queue_finished
shoutout.display.failed
shoutout.official.queued
shoutout.official.sent
shoutout.official.failed
shoutout.inbound.received
shoutout.outbound.created
```

## Dashboard

`htdocs/dashboard/modules/shoutout.js` ist in Tabs aufgeteilt:

```text
Übersicht
Eingehend
Queues
Statistik
Timeline
Settings/Test
```

Der Tab `Eingehend` nutzt:

```text
GET /api/clip-shoutout/inbound
GET /api/clip-shoutout/inbound/stats
```

## Tests

```bat
node --check backend\modules\twitch.js
node --check backend\modules\clip_shoutout.js
node --check htdocs\dashboard\modules\shoutout.js
```

Runtime:

```bat
curl http://127.0.0.1:8080/api/clip-shoutout/inbound
curl http://127.0.0.1:8080/api/clip-shoutout/inbound/stats
```

Debug:

```bat
curl -X POST http://127.0.0.1:8080/api/clip-shoutout/inbound/debug -H "Content-Type: application/json" -d "{\"direction\":\"incoming\",\"from\":\"testsender\",\"to\":\"forrestcgn\",\"viewerCount\":12}"
```

## Offene Punkte

- Live-Test mit echten EventSub-Shoutout-Events.
- Eingehend-Tab nach echten Daten ggf. weiter verfeinern.
- Produktive Umstellung auf `!so` nur ausdrücklich und nach Prüfung.
