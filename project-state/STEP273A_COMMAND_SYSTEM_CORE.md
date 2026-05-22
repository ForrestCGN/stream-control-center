# STEP273A – Command-System Core

Stand: 2026-05-22

## Ziel

Ein zentrales Backend-Command-System wurde vorbereitet, damit Twitch-Chatbefehle künftig direkt im Node-Backend erkannt und an die passenden Module weitergereicht werden können. Streamer.bot soll dadurch schrittweise nur noch Fallback/Altbestand sein und langfristig ersetzt werden können.

## Geänderte/gelieferte Dateien

- `backend/modules/commands.js`
- `tools/easy/STEP273A_APPLY_TWITCH_PRESENCE_COMMAND_HOOK.cjs`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP273A_COMMAND_SYSTEM_CORE.md`

## Wichtig

Der Twitch-Chat-Eingang liegt bereits in `backend/modules/twitch_presence.js`. Damit keine zweite Twitch-IRC-Verbindung entsteht, muss diese Datei einen kleinen Hook bekommen, der `PRIVMSG` an `commands.handleChatMessage(...)` weiterreicht.

Da `twitch_presence.js` eine bestehende große Datei ist, liegt für diesen STEP ein idempotentes Node-Patchtool bei:

```bat
node tools\easy\STEP273A_APPLY_TWITCH_PRESENCE_COMMAND_HOOK.cjs
```

Das Tool fügt nur zwei Stellen ein:

1. `const commands = require('./commands');`
2. einen `PRIVMSG`-Hook direkt nach `handleIrcActivity(parsed);`

Es entfernt keine bestehende Funktionalität.

## Neue Backend-Funktion

Neues Modul:

- `backend/modules/commands.js`

Neue API-Routen:

- `GET /api/commands/status`
- `GET /api/commands/list`
- `POST /api/commands/upsert`
- `POST /api/commands/delete`
- `GET/POST /api/commands/test`
- `GET/POST /api/commands/execute`
- `GET /api/commands/logs`

## Neue DB-Tabellen

Sanfte Schema-Erweiterung per `CREATE TABLE IF NOT EXISTS`:

- `command_definitions`
- `command_execution_log`

Keine bestehende Tabelle wird gelöscht oder überschrieben.

## Seed-Commands

Beim ersten Start werden diese Commands automatisch angelegt, falls sie noch nicht existieren:

- `!rip` → Deathcounter V2 Command-Endpunkt
- `!tode` → Deathcounter V2 Command-Endpunkt
- `!dcount` → Deathcounter V2 Command-Endpunkt, Permission `mod`

Aliases:

- `!rip`: `death`, `tod`
- `!tode`: `deaths`
- `!dcount`: `deathcount`, `deathcounter`

## Bewusst nicht geändert

- Kein Dashboard-Ausbau in diesem STEP.
- Kein Umbau von Deathcounter V2.
- Kein Entfernen bestehender Streamer.bot-kompatibler Endpunkte.
- Keine zweite Twitch-IRC-Verbindung.
- Keine Secrets.
- Keine direkte Änderung an `app.sqlite` außerhalb sanfter Migrationen.

## Tests

Syntaxcheck:

```bat
node --check backend\modules\commands.js
node --check tools\easy\STEP273A_APPLY_TWITCH_PRESENCE_COMMAND_HOOK.cjs
```

Nach dem Entpacken zuerst Hook anwenden:

```bat
node tools\easy\STEP273A_APPLY_TWITCH_PRESENCE_COMMAND_HOOK.cjs
```

Dann Backend neu starten und prüfen:

```bat
curl "http://127.0.0.1:8080/api/commands/status"
curl "http://127.0.0.1:8080/api/commands/list"
curl "http://127.0.0.1:8080/api/commands/test?message=!rip%20@ForrestCGN&user=forrestcgn"
curl "http://127.0.0.1:8080/api/commands/test?message=!dcount%20show&user=forrestcgn&role=mod"
```

Echte Ausführung nur bewusst testen:

```bat
curl "http://127.0.0.1:8080/api/commands/execute?message=!tode&user=forrestcgn"
```

## Nächster sinnvoller STEP

STEP273B:

- Dashboard-Modul `commands` aktivieren.
- Commands sichtbar machen.
- Trigger, Aliase, Aktivierung, Rechte und Cooldowns editierbar machen.
- Testausführung im Dashboard einbauen.
