# Twitch Presence / IRC Bot - Deep Dive

Stand: 2026-05-26  
Quelle: Analyse des Uploads `backend.zip` / Datei `backend/modules/twitch_presence.js`.  
STEP: `STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

## Zweck

IRC-Präsenzbot für Chat-Anwesenheit, aktive User, Chat-Ausgabe und Presence-Status. Wichtig für Chat-Ausgaben und potenziell Punkte-/Aktivitätslogik.

## Datei

- `backend/modules/twitch_presence.js`

## Erkannte API-Routen

| Methode | Pfad |
|---|---|
| `GET` | `/twitch/presence/start` |
| `GET` | `/api/twitch/presence/start` |
| `GET` | `/twitch/presence/stop` |
| `GET` | `/api/twitch/presence/stop` |
| `GET` | `/twitch/presence/status` |
| `GET` | `/api/twitch/presence/status` |
| `GET` | `/twitch/presence/send` |
| `GET` | `/api/twitch/presence/send` |
| `POST` | `/twitch/presence/send` |
| `POST` | `/api/twitch/presence/send` |
| `GET` | `/api/twitch/presence/config` |
| `GET` | `/api/twitch/presence/settings` |
| `GET` | `/api/twitch/presence/routes` |
| `GET` | `/api/twitch/presence/integration-check` |
| `POST` | `/api/twitch/presence/reload` |
| `GET` | `/api/twitch/presence/activity` |
| `GET` | `/api/twitch/presence/activity/active` |
| `POST` | `/api/twitch/presence/activity/clear` |
| `GET` | `/api/twitch/presence/activity/test` |
| `GET/POST` | `/api/twitch/presence/send` |

## Erkannte Hauptfunktionen / interne Bereiche

- `sendChatMessage`
- `refreshBotTokens`
- `getBotAccessTokenWithRefresh`
- `sendChatMessageInternal`
- `startConnectionInternal`
- `stopConnectionInternal`
- `handlePresenceStart`
- `handlePresenceStop`
- `handlePresenceSend`
- `getPresenceStatus`
- `getActiveUsers`
- `init`
- `readJSON`
- `writeJSON`
- `nowIso`
- `isoMs`
- `addMinutesIso`
- `cleanLogin`
- `cleanDisplayName`
- `normalizeSubscriberTier`
- `parseTags`
- `parseBadges`
- `extractLoginFromPrefix`
- `parseIrcLine`
- `getActivityStatusForUser`
- `ensureActivitySchema`
- `rowToActivityUser`
- `saveActivityUser`
- `getActivityUser`
- `markActivity`
- `handleIrcActivity`
- `refreshActivityStatuses`
- `listActivityUsers`
- `listActiveUsers`
- `clearActivity`
- `getStoredBotToken`
- `cleanupTimers`
- `resetStateForSocketClose`
- `scheduleReconnect`
- `startPingLoop`
- `safeCloseSocket`
- `maybeSendJoinMessage`
- `sanitizeOutgoingChatMessage`
- `buildPresenceStatus`
- `handlePresenceStatus`
- `fileCheck`
- `buildPresenceRoutes`
- `buildPresenceConfig`
- `buildPresenceSettings`
- `buildCheck`
- `summarizeChecks`
- `buildPresenceIntegrationCheck`
- `handlePresenceConfig`
- `handlePresenceSettings`
- `handlePresenceRoutes`
- `handlePresenceIntegrationCheck`
- `handlePresenceReload`
- `handleActivityList`
- `handleActivityActive`
- `handleActivityClear`
- `handleActivityTest`
- `BOT_USERNAME`
- `BOT_CHANNEL`
- `BOT_CLIENT_ID`
- `BOT_CLIENT_SECRET`
- `JOIN_MESSAGE`
- `epoch`
- `fail`

## Erkannte Datenbanktabellen

- `twitch_presence_activity`

## Wichtige Abhängigkeiten

- `Twitch IRC WebSocket`
- `Twitch Bot OAuth Token`
- `SQLite Tabelle twitch_presence_activity`
- `twitch.js für Token-Refresh/Identity-Kontext`

## Runtime-/State-Themen

- Das Modul wird über `backend/server.js`/Modul-Initialisierung geladen.
- Status-/Config-/Routes-/Integration-Check-Routen sind, soweit vorhanden, als primäre Diagnosepunkte zu verwenden.
- Echte Runtime-Werte müssen am Live-System über die Statusrouten geprüft werden; diese Doku beschreibt den aus Dateien erkennbaren Stand.

## Dashboard-/Overlay-Anbindung

- Dashboard-Dateien waren in diesem Upload nicht vollständig enthalten. Deshalb ist die Dashboard-Anbindung hier nur aus Backend-Routen ableitbar.
- Vor UI-Änderungen müssen die echten Dateien unter `htdocs/dashboard/` geprüft werden.
- Vor Overlay-Änderungen müssen die echten Dateien unter `htdocs/overlays/` geprüft werden.

## Risiken / Regeln

- `Start/Stop/Send-Routen können echte Chat-Ausgaben auslösen. Tests vorsichtig ausführen.`
- `Aktivitätslogik hängt von IRC-Tags/Badges ab; Änderungen an Parsern können viele Systeme beeinflussen.`

## Sinnvolle Tests

- `GET /api/twitch/presence/status`
- `GET /api/twitch/presence/activity`
- `GET /api/twitch/presence/activity/active`
- `GET /api/twitch/presence/integration-check`

## Offene Punkte

- Modul-Doku nach jedem funktionalen STEP aktualisieren.
- Dashboard-Dateien beim nächsten passenden UI-STEP ergänzend dokumentieren.
- Config-/Message-Dateien aus dem echten Repo/Live-Stand gegen diese Doku gegenprüfen.
