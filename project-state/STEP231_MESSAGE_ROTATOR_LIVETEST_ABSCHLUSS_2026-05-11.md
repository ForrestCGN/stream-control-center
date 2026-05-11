# STEP231 - Message-Rotator Livetest Abschluss und Doku

Stand: 2026-05-11

## Ziel

Dieser STEP dokumentiert den abgeschlossenen Message-Rotator-Integrationsblock nach erfolgreichem Livetest.

Der Message-Rotator ist jetzt in Backend, Datenbank, Dashboard und Runtime nutzbar. Die produktive Nutzung wurde im Stream getestet und als erfolgreich bewertet.

## Geprüfter Stand

### Backend

- `backend/modules/message_rotator.js` ist aktiv.
- Settings werden über die Datenbanktabelle `message_rotator_settings` geladen.
- JSON `config/message_rotator.json` bleibt als Fallback erhalten.
- Runtime-Status und Admin-APIs arbeiten ohne Fehler.

### Datenbank / Texte

- Rotator-Texte werden über `module_text_variants` verwaltet.
- Modulname: `message_rotator`.
- Aktive Varianten werden vom Backend zufällig ausgewählt.
- Gewichtung über `weight` ist vorbereitet und aktiv nutzbar.
- JSON-Dateien unter `config/messages/*.json` bleiben als Fallback erhalten.

Aktive Text-Keys:

```text
follow_reminder
discord_reminder
youtube_reminder
```

### Dashboard

- Dashboard-Modul `message_rotator` ist unter System verfügbar.
- Status, Start/Stop/Reload, Settings, Items, Nachrichtenvarianten und Integration-Check sind bedienbar.
- Dashboard schreibt nicht direkt in SQLite und bearbeitet keine JSON-Dateien direkt.
- Dashboard nutzt ausschließlich Backend-APIs.

### Runtime / API

Geprüfte Routen:

```text
GET/POST /api/message-rotator/status
GET/POST /api/message-rotator/start
GET/POST /api/message-rotator/stop
GET/POST /api/message-rotator/tick
GET/POST /api/message-rotator/next
GET/POST /api/message-rotator/manual
GET/POST /api/message-rotator/reload
GET      /api/message-rotator/admin/settings
POST     /api/message-rotator/admin/settings
GET      /api/message-rotator/admin/texts
POST     /api/message-rotator/admin/texts
GET      /api/message-rotator/integration-check
```

## Tests / Befunde

### API-Tests

Erfolgreich geprüft:

```text
/api/message-rotator/status
/api/message-rotator/admin/settings
/api/message-rotator/admin/texts
/api/message-rotator/integration-check
```

Integration-Check:

```text
healthy = true
warnings = []
errors = []
```

Text-Runtime:

```text
source = database_variants_with_json_fallback
module = message_rotator
```

### Settings-Test

Dashboard-Änderungen an Runtime-Settings wurden korrekt in `message_rotator_settings` gespeichert und von der Runtime übernommen.

Geprüfte Felder:

```text
runtime.firstMessageDelayMinutes
runtime.globalCooldownMinutes
runtime.minChatMessagesBetweenRotations
```

### Textvarianten-Test

Dashboard-Anlegen und Löschen von Textvarianten wurde erfolgreich getestet.

Nach Bereinigung der Testvarianten war der erwartete Stand wieder aktiv:

```text
variantCount = 7
```

### Start/Stop/Tick/Next-Test

Erfolgreich geprüft:

```text
start -> active = true
stop -> active = false
10 simulierte Ticks -> chatMessagesSinceLastSend = 10, totalTicks = 10
next bei aktivem firstMessageDelay -> send = false, reason = first_message_delay
```

Der Block durch `first_message_delay` ist korrekt und schützt vor zu frühem Senden nach Rotator-Start.

### Livetest

Der Message-Rotator lief im Stream am Vorabend erfolgreich und ohne gemeldete Probleme.

## Bewusst nicht geändert

```text
backend/core/database.js
backend/modules/helpers/**
backend/modules/sqlite_core.js
config/**
app.sqlite
andere Dashboard-Module fachlich
Streamer.bot Actions in diesem Doku-STEP
```

## Aktueller produktiver Normalbetrieb

Empfohlene Standardwerte:

```text
runtime.firstMessageDelayMinutes = 15
runtime.globalCooldownMinutes = 20
runtime.minChatMessagesBetweenRotations = 8
runtime.onlyWhenLive = nach Betriebswunsch setzen
chat.ignoreBots = true
```

## Offene spätere Verbesserungen

Sinnvolle spätere Erweiterungen, nicht Teil dieses Abschluss-STEPs:

```text
- Rotator-History / Log gesendeter Nachrichten
- Rotator-Statistiken pro Key/Item
- Dashboard-Komfort: Sortierung, Filter, Kopieren von Varianten
- Streamer.bot-Actions vollständig dokumentieren oder vereinheitlichen
- optional: Anzeige der letzten gesendeten Rotator-Nachrichten im Dashboard
```

## Ergebnis

Der Message-Rotator-Integrationsblock ist abgeschlossen und produktiv nutzbar.

Status:

```text
ABGENOMMEN / STABLE
```
