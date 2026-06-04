# Clip-Shoutout / AutoShoutout Modul

Stand: CAN-44.13.5 / Modul `clip_shoutout` Version `0.2.24`

## Zweck

Diese Datei ist die Fachdatei zum AutoShoutout-Unterbereich. Die Haupt-Modul-Doku steht in `docs/modules/clip-shoutout-vso.md`. Der Modulindex steht in `docs/modules/README.md`.

Das AutoShoutout-System ist Teil des Moduls `backend/modules/clip_shoutout.js`. Es erkennt konfigurierte Streamer im Twitch-Chat und löst nach einstellbaren Regeln automatisch einen Video-Shoutout sowie optional einen offiziellen Twitch-Shoutout aus.

Der AutoShoutout ist bewusst an das bestehende Shoutout-System gekoppelt:

- Video-/Clip-Shoutout läuft über die DisplayQueue.
- Offizieller Twitch-Shoutout kann nach dem Video-Shoutout in die OfficialQueue gelegt werden.
- Start-Szene-Gate kann DisplayQueue und OfficialQueue blockieren.
- Streamtag-/Cooldown-Regeln sollen doppelte Shoutouts verhindern.
- Texte laufen über das zentrale Text-/Varianten-System `helper_texts`.

## Wichtige Dateien

- `backend/modules/clip_shoutout.js`
- `htdocs/dashboard/modules/auto_shoutout.js`
- `htdocs/dashboard/modules/auto_shoutout.css`
- `config/clip_system.json` als Seed/Fallback, nicht als alleinige Wahrheit
- SQLite/MariaDB über `backend/core/database.js`
- Text-Helper: `backend/modules/helpers/helper_texts.js`
- Message-Helper: `backend/modules/helpers/helper_messages.js`


## API-Routen AutoShoutout

AutoShoutout hängt unter dem Shoutout-Modul und nutzt denselben Backend-Kontext.

```text
GET  /api/clip-shoutout/auto
GET  /api/clip-shoutout/auto/settings
POST /api/clip-shoutout/auto/settings
GET  /api/clip-shoutout/auto/streamers
POST /api/clip-shoutout/auto/streamers
POST /api/clip-shoutout/auto/streamers/remove
POST /api/clip-shoutout/auto/test-chat
GET  /api/clip-shoutout/auto/texts
POST /api/clip-shoutout/auto/texts
POST /api/clip-shoutout/auto/reset-day
POST /api/clip-shoutout/auto/clear-target
GET  /api/clip-shoutout/queue
GET  /api/clip-shoutout/status
```

### Routen-Zweck

| Route | Zweck |
|---|---|
| `GET /auto` | Gesamtstatus: Settings, Streamer, Events, Activity, TextEditor, Queue-Auszug |
| `GET /auto/settings` | AutoShoutout-Settings lesen |
| `POST /auto/settings` | AutoShoutout-Settings speichern |
| `GET /auto/streamers` | konfigurierte AutoSO-Streamer lesen |
| `POST /auto/streamers` | Streamer hinzufügen/aktualisieren |
| `POST /auto/streamers/remove` | Streamer entfernen/deaktivieren |
| `POST /auto/test-chat` | Chat-Aktivität simulieren; seit CAN-44.13.1 standardmäßig Dry-Run |
| `GET /auto/texts` | Textvarianten für AutoShoutout lesen |
| `POST /auto/texts` | Textvarianten speichern/ersetzen |
| `POST /auto/reset-day` | breiter Tagesreset; vorsichtig nutzen |
| `POST /auto/clear-target` | gezielter Reset für einen Login |
| `GET /queue` | DisplayQueue und OfficialQueue prüfen |
| `GET /status` | Modulstatus und Route-/Queue-Status prüfen |

### Test-Sicherheit

`POST /api/clip-shoutout/auto/test-chat` darf ohne `execute=true` oder `dryRun=false` keinen echten Shoutout auslösen.


## Datenbanktabellen

```text
clip_shoutout_auto_settings
clip_shoutout_auto_streamers
clip_shoutout_auto_events
clip_shoutout_auto_message_activity
module_text_variants
module_texts (Legacy/Fallback je nach Helper-Stand)
```

### Tabellen-Zweck

| Tabelle | Zweck |
|---|---|
| `clip_shoutout_auto_settings` | persistente AutoSO-Settings als DB-Wahrheit |
| `clip_shoutout_auto_streamers` | Liste konfigurierter AutoSO-Streamer inkl. Flags |
| `clip_shoutout_auto_events` | AutoSO-Ereignisse, Trigger, Skip-/Queued-Status |
| `clip_shoutout_auto_message_activity` | Message-Threshold-Zählung pro Login/Streamtag |
| `module_text_variants` | aktive Textvarianten für `auto.greeting` |
| `module_texts` | Legacy-/Fallback-Tabelle des Textsystems |

Queue-/History-Tabellen des Haupt-Shoutout-Moduls werden über DisplayQueue/OfficialQueue genutzt und vor Änderungen anhand der echten Datei geprüft.

## Konfigurationsquelle

AutoShoutout liest die aktiven Settings bevorzugt aus der Datenbank:

- Tabelle: `clip_shoutout_auto_settings`
- Key: AutoShoutout-Settings als JSON
- `configSource: database` bedeutet: DB überschreibt JSON-Fallback.
- `jsonFallbackUsed: false` bedeutet: Live-Stand kommt nicht aus `clip_system.json`.

`config/clip_system.json` bleibt Seed/Fallback und darf nicht blind über Live-DB-Werte gelegt werden.

## Aktuelle Kernsettings

| Setting | Bedeutung | aktueller/Standardwert |
|---|---|---|
| `enabled` | AutoShoutout aktiv | `true` |
| `onlyWhenLive` | nur bei Live-Status auslösen | aktuell bewusst `false` für Tests |
| `triggerOnFirstMessageOnly` | Legacy-Setting / alte Logik | derzeit noch vorhanden |
| `minMessagesBeforeTrigger` | Mindestanzahl Chatnachrichten bis Trigger | Standard `3` |
| `messageWindowMs` | Zeitfenster für Mindestnachrichten | Standard `1800000` = 30 Minuten |
| `greetingEnabled` | Begrüßung beim Trigger senden | `true` |
| `greetingOnlyWhenTriggering` | Begrüßung nur beim echten Trigger | `true` |
| `greetingTextKey` | Textvarianten-Key | `auto.greeting` |
| `respectStreamDayLimit` | Streamtag-Limit beachten | `true` |
| `globalCooldownMs` | globaler AutoSO-Cooldown | Standard `120000` |
| `perStreamerCooldownMs` | Cooldown pro Streamer | Standard `43200000` |
| `sendChatMessage` | Chatmeldungen senden | `true` |
| `storeSkippedEvents` | Skips dauerhaft speichern | Standard/aktuell `false` |

## Ablauf: Chatnachrichten-Threshold

1. Twitch-Chatnachricht trifft im Presence-/Chat-System ein.
2. AutoShoutout prüft, ob der Login in `clip_shoutout_auto_streamers` konfiguriert und aktiv ist.
3. Wenn `onlyWhenLive=true`, wird der Live-Status geprüft. Aktuell kann dieser für Tests deaktiviert sein.
4. Streamtag, Queue, Cooldowns und bereits erhaltene Shoutouts werden geprüft.
5. Die Chataktivität wird in `clip_shoutout_auto_message_activity` gezählt.
6. Unterhalb von `minMessagesBeforeTrigger` wird nur gezählt. Es gibt keine Chatmeldung.
7. Bei Erreichen des Thresholds wird optional eine Begrüßung aus `helper_texts` gepickt.
8. Danach wird der Video-Shoutout in die DisplayQueue gelegt.
9. Nach dem Video-Shoutout wird optional ein offizieller Twitch-Shoutout in die OfficialQueue gelegt.

Standardverhalten:

```text
Nachricht 1/3 -> zählt, kein Shoutout
Nachricht 2/3 -> zählt, kein Shoutout
Nachricht 3/3 -> Begrüßung + AutoShoutout
```

## Chatmeldungen

### Begrüßung

- Modul: `clip_shoutout`
- Text-Key: `auto.greeting`
- Kategorie: `auto_shoutout`
- Verwaltung über Dashboard/Textvarianten.

Beispielvarianten:

```text
👋 @{displayName} ist im Altersheim eingetroffen. Die Pfleger schieben direkt mal den Shouti-Wagen los.
🧓 Achtung, @{displayName} hat sich an der Rezeption gemeldet. Zeit für einen ordentlichen Shouti aus dem CGN-Altersheim.
📺 @{displayName} ist da und hat genug Lebenszeichen gesendet. Der AutoShouti wird aus dem Rentner-Regal geholt.
💜 Willkommen @{displayName}! Die CGN-Rentnercrew startet schon mal den Shouti-Rollator.
☕ @{displayName} hat sich blicken lassen. Kaffee steht bereit, Shouti wird angeschoben.
```

### Queue-Meldungen

Diese Meldungen liegen weiterhin in den AutoShoutout-Settings:

- `messages.queued`
- `messages.alreadyQueued`
- `messages.waitingStartScene`
- `messages.cooldown`
- `messages.alreadyReceived`
- `messages.disabled`

Wichtig: `alreadyReceived`, `cooldown` und `disabled` sollen in der Regel nicht öffentlich spammen. Die Anti-Spam-/Suppress-Logik bleibt zu beachten.

## Dashboard

AutoShoutout ist als eigener Tab im Shoutout-System eingebunden.

Wichtige Bereiche:

- globale AutoSO-Settings
- Mindestnachrichten bis AutoShouti
- Nachrichten-Zeitfenster in Minuten
- Begrüßung aktiv/deaktiviert
- Begrüßung nur beim tatsächlichen Trigger
- Begrüßungstexte / Varianten, eine Variante pro Zeile
- konfigurierte Streamer
- letzte AutoSO-Ereignisse
- letzte Chataktivität / Threshold-Status
- Start-Szene-/Live-Status-Anzeige

## Start-Szene-Gate

AutoShoutout nutzt das vorhandene SceneGate:

- `sceneGate.enabled`
- `sceneGate.blockDuringStartScene`
- `sceneGate.startSceneNames`
- `sceneGate.retryMs`

Wenn eine Startszene aktiv ist, darf der Shoutout eingereiht, aber erst nach der Startszene abgespielt werden.

Aktuell bekannte Start-Szenen:

```text
Stream startet
Stream Start
Start
START
Starting
Stream starting
```

Die Szene `Ende` ist aktuell keine Start-Szene und blockiert daher nicht.

## Live-Status

Der AutoShoutout kann über `onlyWhenLive` an den Live-Status gekoppelt werden.

Aktuell ist `onlyWhenLive=false` bewusst möglich, damit im Stream getestet werden kann. Langfristig sollte das wieder aktiviert werden, sobald der Live-Status-Monitor sicher genug ist.

Der offizielle Twitch-Shoutout hat zusätzlich ein eigenes Live-Gate:

- `officialQueue.liveGate.enabled`

Auch dieses kann getrennt aktiv/inaktiv sein.

## Dry-Run / Test-Sicherheit

Seit CAN-44.13.1 ist der Test-Endpunkt standardmäßig ein Dry-Run:

```http
POST /api/clip-shoutout/auto/test-chat
```

Ohne `execute=true` oder `dryRun=false` darf dieser Endpunkt keinen echten Shoutout einreihen.

Echter Test nur bewusst:

```json
{
  "login": "fadjoe81",
  "displayName": "fadjoe81",
  "message": "Testnachricht",
  "execute": true
}
```

## Clear-Target / gezieltes Zurücksetzen

Seit CAN-44.13.1 gibt es einen gezielten Reset-Endpunkt:

```http
POST /api/clip-shoutout/auto/clear-target
```

Zweck:

- AutoShoutout-Teststatus für einen Login entfernen
- passende Auto-Events entfernen
- passende Message-Activity entfernen
- passende DisplayQueue-Einträge auf `removed` setzen
- optional OfficialQueue-/History-Bezüge entfernen
- keine anderen Streamer anfassen

Beispiel:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/clear-target" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"login":"fadjoe81","reason":"test_clear_before_stream"}' |
  ConvertTo-Json -Depth 8
```

## Reset-Day

`POST /api/clip-shoutout/auto/reset-day` ist für breitere Tages-/Test-Resets gedacht. Dieser Endpunkt darf nicht leichtfertig im Stream genutzt werden, weil er mehrere AutoShoutout-Einträge betreffen kann. Für einzelne Streamer bevorzugt `clear-target` verwenden.

## Sicherheit / Arbeitsregeln

- Bestehende Funktionalität nicht entfernen.
- DB niemals ersetzen oder neu bauen.
- Neue Tabellen nur mit `CREATE TABLE IF NOT EXISTS` und sanften Migrationen.
- Live-DB-Werte nicht durch JSON überschreiben.
- Test-Endpunkte müssen standardmäßig sicher sein.
- Vor ZIP-/STEP-Ausgabe Syntax und kritische Endpunkte prüfen.
