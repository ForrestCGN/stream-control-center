# CAN-44.16 – Shoutout Text Inventory & Text-Key Migration Plan

Stand: 2026-06-04
Typ: Doku / Planung
Code-Änderung: nein

## Ziel

Vor dem späteren Dashboard-Umbau und vor dem gemeinsamen Texte-Tab wird der aktuelle Textbestand des Shoutout-Systems erfasst und eine saubere Migration auf die bestehenden Projektstandards geplant.

Das Shoutout-System umfasst:

- Chat-Shoutout (`!so`, Alias u. a. `!vso`)
- AutoShoutout
- DisplayQueue / Video-Clip-Shoutout
- offizieller Twitch-Shoutout
- eingehende/ausgehende Twitch-Shoutout-Events
- Dashboard-Auslösung und Diagnose

## Verbindliche Standards

Für alle weiteren Schritte gilt:

- keine neue Parallelstruktur für Texte
- vorhandene Helper zuerst nutzen, insbesondere `helper_texts`, `helper_messages`, `helper_config`, `helper_core`, `helper_routes`, `helper_cooldown`, `helper_queue`, sofern passend
- DB-Zugriff über vorhandene DB-/Core-Helper
- Schemaänderungen nur sanft per `CREATE TABLE IF NOT EXISTS`, `ensureTableColumn` oder kompatibler Migration
- bestehende `app.sqlite` niemals ersetzen
- DB-Design so planen, dass spätere MariaDB-Unterstützung nicht verbaut wird
- JSON bleibt Seed/Fallback, primäre editierbare Texte langfristig über DB/Text-Helper
- keine bestehende Funktionalität entfernen

## Aktueller Textbestand im Shoutout-System

### 1. Chat-Shoutout / DisplayQueue

Aktuelle Quellen im Modul `clip_shoutout`:

- `clipShoutout.chatMessage`
- `displayQueue.acceptedMessage`
- `displayQueue.waitingMessage`
- `displayQueue.startedMessage`
- `displayQueue.failedMessage`
- `streamDayLimit.duplicateMessage`

Aktuelle Rolle:

- Rückmeldung nach `!so` / Alias
- Warteschlangen-Hinweis
- Fehlerhinweis
- Hinweis, wenn Ziel in diesem Stream bereits einen Shoutout hatte

### 2. AutoShoutout

Aktuelle Quellen:

- `autoShoutout.queuedMessage`
- `autoShoutout.messages.queued`
- `autoShoutout.messages.alreadyQueued`
- `autoShoutout.messages.alreadyReceived`
- `autoShoutout.messages.cooldown`
- `autoShoutout.messages.waitingStartScene`
- `autoShoutout.messages.disabled`
- `auto.greeting` über `helper_texts` / `module_text_variants`

Aktuelle Besonderheit:

- `auto.greeting` nutzt bereits den Varianten-Helper.
- Skip-Hinweise wie `alreadyReceived`, `cooldown`, `disabled` werden aktuell bewusst nicht in den Chat gespammt.
- `queued` kann bei sehr kurzer Wartezeit unterdrückt werden.

### 3. Offizieller Twitch-Shoutout

Aktuelle Quellen:

- `officialShoutout.acceptedMessage`
- `officialShoutout.queuedMessage`
- `officialShoutout.sentMessage`
- `officialShoutout.duplicateQueuedMessage`
- `officialShoutout.targetCooldownMessage`
- `officialShoutout.failedMessage`

Aktuelle Besonderheit:

- Chatmeldungen des offiziellen Folgeprozesses sind aktuell im Code bewusst deaktiviert.
- Offizielle Shoutouts bleiben trotzdem in Queue/History nachvollziehbar.

### 4. System-/Diagnose-Texte

Aktuell größtenteils technisch und nicht vollständig als editierbare Textvarianten gepflegt:

- Production-Check-Hinweise
- Live-Test-Hinweise
- Debug-/Diagnose-Labels
- Dashboard-Notices
- Fehlertexte aus Routen

Diese Texte müssen später getrennt bewertet werden: nicht alles muss in den Stream-Chat, aber relevante Dashboard-/Systemtexte sollten ebenfalls standardisiert werden.

## Geplante neue Text-Key-Struktur

Neue Textkeys sollen einheitlich unter `shoutout.*` liegen.

### Kategorie `shoutout.chat`

```text
shoutout.chat.accepted
shoutout.chat.waiting
shoutout.chat.started
shoutout.chat.failed
shoutout.chat.duplicate_stream_day
shoutout.chat.no_clip
shoutout.chat.permission_denied
```

### Kategorie `shoutout.auto`

```text
shoutout.auto.greeting
shoutout.auto.queued
shoutout.auto.already_queued
shoutout.auto.waiting_start_scene
shoutout.auto.cooldown
shoutout.auto.disabled
shoutout.auto.threshold_waiting
```

### Kategorie `shoutout.official`

```text
shoutout.official.queued
shoutout.official.sent
shoutout.official.failed
shoutout.official.cooldown
shoutout.official.waiting_live
shoutout.official.duplicate
```

### Kategorie `shoutout.dashboard`

```text
shoutout.dashboard.saved
shoutout.dashboard.error
shoutout.dashboard.test_dryrun_note
shoutout.dashboard.clear_target_success
```

### Kategorie `shoutout.system`

```text
shoutout.system.production_check_note
shoutout.system.live_test_note
shoutout.system.scene_gate_waiting
shoutout.system.live_gate_waiting
```

## Migrationsstrategie

### Phase 1: Inventar und Fallback

- bestehende Config-Texte nicht löschen
- neue Defaults für `helper_texts` vorbereiten
- `auto.greeting` als Legacy-Key weiter unterstützen
- neue Key-Struktur als bevorzugte Zielstruktur dokumentieren

### Phase 2: Seed in `module_text_variants`

- neue Defaults in `clip_shoutout.js` oder in einem späteren Text-Setup sauber definieren
- beim Modulstart per `seedModuleTextVariants` einspielen
- bestehende Werte nicht überschreiben

### Phase 3: Render-Zugriff vereinheitlichen

- Chat-/Display-/Auto-/Official-Texte nicht mehr direkt aus Config rendern, sondern über Helper-Funktion
- Fallback-Reihenfolge:
  1. DB/Textvarianten
  2. neue Default-Keys
  3. Legacy-Config-Wert
  4. statischer Notfall-Fallback

### Phase 4: Dashboard-Texte-Tab

- eigener Tab `Texte`
- Kategorien auswählbar:
  - Chat-Shoutout
  - AutoShoutout
  - Offizieller Shoutout
  - Dashboard/System
- Varianten je Text-Key hinzufügen, bearbeiten, deaktivieren, löschen
- Platzhalter anzeigen
- keine Textänderungen ohne Speichern übernehmen

## Platzhalter

Gemeinsame Platzhalter für Shoutout-Texte:

```text
{login}
{displayName}
@{displayName}
{targetLogin}
{targetDisplay}
{requestedByLogin}
{requestedByDisplay}
{waitTime}
{reason}
{streamDayId}
{clipTitle}
{clipUrl}
{gameName}
{messageCount}
{requiredMessages}
```

Wichtig:

- `@{displayName}` soll weiterhin sauber zu `@Name` gerendert werden.
- Alte Platzhalter wie `{waitTime}` bleiben kompatibel.
- Neue Texte dürfen keine Twitch-/Dashboard-spezifischen technischen Details erzwingen.

## Offene Punkte vor Umsetzung

- finale deutsche Textformulierungen gemeinsam überarbeiten
- entscheiden, ob `auto.greeting` direkt zu `shoutout.auto.greeting` migriert oder nur gespiegelt wird
- entscheiden, ob Chat-Shoutout-Texte sofort in Varianten wandern oder erst parallel laufen
- prüfen, ob `helper_texts.handleModuleTextEditorPayload` für den gemeinsamen Tab ausreicht oder eine Shoutout-spezifische Wrapper-Route sinnvoller ist
- Dashboard-Text-Tab erst nach Routen-/Fallback-Plan bauen

## Nächster Schritt

CAN-44.17 sollte entweder sein:

```text
CAN-44.17 – Shoutout Text Backend Routes Plan
```

oder direkt, falls nach Prüfung ausreichend klar:

```text
CAN-44.17 – Shoutout Text Routes Foundation
```

Empfehlung: zuerst Backend-Routen sauber planen, dann Dashboard neu bauen.
