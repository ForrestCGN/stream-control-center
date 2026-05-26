# Channelpoints / Kanalpunkte

Aktueller Stand: v0.7.5 (`eventbus-docs-final-polish`)

## Lokaler Fertigstand
- Lokale Kategorien und Rewards in SQLite.
- Modal-Editor analog Commands.
- Draft-State bleibt beim MediaPicker stabil.
- Sound/Video über bestehendes Media-System und `/api/sound/play`.
- Text-Rewards lokal ausführbar und im Redemption-Ergebnis speicherbar.
- Redemption-Testflow mit `channelpoints_redemptions`.
- Dashboard-Verlauf für Einlösungen/Testverlauf.
- Twitch-Sync-Readiness-Panel ohne Schreibzugriffe.
- EventBus-Domain-Events für Rewards, Redemptions und Twitch-Readiness.

## Versionierung
- Backend: `MODULE_VERSION = 0.7.5`, `MODULE_BUILD = eventbus-docs-final-polish`
- Dashboard: `UI_VERSION = 0.7.5`, `UI_BUILD = eventbus-docs-final-polish`

## Wichtige Routen
- `GET /api/channelpoints/status`
- `GET /api/channelpoints/rewards`
- `POST /api/channelpoints/rewards`
- `PUT /api/channelpoints/rewards/:idOrKey`
- `POST /api/channelpoints/rewards/:idOrKey/delete`
- `GET /api/channelpoints/redemptions?limit=25`
- `POST /api/channelpoints/redemptions/test`
- `POST /api/channelpoints/rewards/:idOrKey/execute`
- `GET /api/channelpoints/twitch-status`
- `GET /api/channelpoints/twitch/readiness`
- `GET /api/channelpoints/bus-events`
- `GET /api/channelpoints/bus-test`

## EventBus-Domain-Events
Alle Events sind lokal, replayable und enthalten `module`, `moduleVersion`, `moduleBuild`, `twitchWrite:false`.

| Channel | Action | Auslöser |
|---|---|---|
| `channelpoints.reward` | `channelpoints.reward.created` | Lokaler Reward erstellt |
| `channelpoints.reward` | `channelpoints.reward.updated` | Lokaler Reward bearbeitet |
| `channelpoints.reward` | `channelpoints.reward.deleted` | Lokaler Reward gelöscht |
| `channelpoints.reward` | `channelpoints.reward.enabled` | Lokaler Reward aktiviert |
| `channelpoints.reward` | `channelpoints.reward.disabled` | Lokaler Reward deaktiviert/pausiert |
| `channelpoints.redemption` | `channelpoints.redemption.created` | Lokale/Test-Einlösung gespeichert |
| `channelpoints.redemption` | `channelpoints.redemption.executed` | Einlösung erfolgreich ausgeführt |
| `channelpoints.redemption` | `channelpoints.redemption.failed` | Einlösung fehlgeschlagen |
| `channelpoints.twitch` | `channelpoints.twitch.readiness` | Twitch-Readiness abgefragt |
| `channelpoints.test` | `ping` | Bus-Selbsttest |

## Twitch-Regel
Bis einschließlich v0.7.5 werden keine Twitch-Rewards geschrieben, gelöscht oder deaktiviert. Alle Änderungen sind lokal. Der Twitch-Bereich zeigt nur Bereitschaft, Scopes und geplanten Flow.

## Nächste echte Twitch-Schritte
1. Token-/Scope-Check read-only anbinden.
2. Read-only Twitch-Reward-Sync bauen.
3. Lokale Rewards mit Twitch Reward-IDs mappen.
4. EventSub-Redemption-Handler anbinden.
5. Danach erst Fulfill/Cancel/Enable/Disable als echte Twitch-Schreibaktionen planen.


## Kanalpunkte v0.8.0 — Twitch Auth/Scope Check

- Backend-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Dashboard-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Neue Route `GET /api/channelpoints/twitch/auth-check`.
- Prüft vorhandenen Twitch-User-Token und Scopes über `/api/twitch/auth/validate`.
- Benötigt für Read-only: `channel:read:redemptions` oder `channel:manage:redemptions`.
- Benötigt für spätere Schreibaktionen: `channel:manage:redemptions`.
- Keine Twitch-Schreibzugriffe, keine DB-Schemaänderung.
