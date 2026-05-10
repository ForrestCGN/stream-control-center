# STEP210 - Twitch DB-Core-Portabilitaet

Stand: 2026-05-10

## Ziel

`twitch.js` soll nicht mehr direkt an `backend/modules/sqlite_core.js` gekoppelt sein.

Der Twitch-Provider bleibt funktional gleich, nutzt fuer seine Alert-Bridge-Settings aber die zentrale Datenbank-Schicht:

```text
backend/core/database.js
```

## Betroffene Datei

```text
backend/modules/twitch.js
```

## Geaendert

- Direkter Import von `./sqlite_core` entfernt.
- Import von `../core/database` ergaenzt.
- `ensureTwitchAlertSettingsTable()` nutzt jetzt `database.ensureReady(ctx)` und `database.exec(...)`.
- Lesen der Twitch-Alert-Settings nutzt jetzt `database.get(...)`.
- Speichern der Twitch-Alert-Settings nutzt jetzt `database.run(...)`.
- Settings-Source-Labels wurden von SQLite-spezifischen Namen auf `core_database` umgestellt.

## Bewusst nicht geaendert

- Keine Twitch-OAuth-Logik geaendert.
- Keine Twitch-Helix-Routen geaendert.
- Keine EventSub-WebSocket-Logik geaendert.
- Keine Alert-Forwarding-Logik geaendert.
- Keine Tabellenstruktur geaendert.
- Keine Datenmigration ausgefuehrt.
- Kein MySQL-/MariaDB-Treiber installiert.
- Keine MySQL-/MariaDB-Verbindung aktiviert.
- `sqlite_core.js` bleibt unveraendert.
- SQLite bleibt produktiver Standard.

## Technische Einordnung

Die Tabelle `alert_settings` bleibt unveraendert und wird weiterhin sanft per `CREATE TABLE IF NOT EXISTS` angelegt.

Aktuell laeuft der Zugriff weiterhin ueber SQLite:

```text
twitch.js -> backend/core/database.js -> backend/modules/sqlite_core.js -> data/sqlite/app.sqlite
```

MySQL/MariaDB werden dadurch nicht aktiv genutzt. Der STEP reduziert nur die direkte Kopplung an `sqlite_core.js`.

## Syntaxcheck

```powershell
node --check backend\modules	witch.js
```

## Live-Test nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status" | ConvertTo-Json -Depth 100
```

Erwartung:

- `ok = true`
- Alert-Bridge-Status wird ausgegeben.
- EventSub-Status wird ausgegeben.
- Keine Fehler in `lastError`.
- Twitch/EventSub verbindet weiterhin wie vorher.

## Naechster sinnvoller Schritt

Danach ein weiteres kleineres direktes `sqlite_core`-Modul portieren oder erst die Twitch-Portierung live testen.

Naechste Kandidaten:

```text
sound_system.js
dashboard_auth.js
```

Grosse Module wie `alert_system.js`, `tagebuch.js`, `todo.js` und `challenge.js` bleiben eigene spaetere STEPs.
