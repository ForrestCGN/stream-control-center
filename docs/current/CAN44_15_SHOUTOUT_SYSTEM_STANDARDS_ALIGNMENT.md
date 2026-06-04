# CAN-44.15 – Shoutout System Standards Alignment

Stand: 2026-06-04

## Ziel

Dieser Step ist eine reine Struktur-/Planungs- und Dokumentations-Ergänzung für den weiteren Umbau des gemeinsamen Shoutout-Systems.

Es gibt in diesem Step keine Code-Änderung.

Das Shoutout-System umfasst künftig gemeinsam:

- Chat-Shoutout (`!so`, Alias `!vso`, Dashboard-Auslösung)
- AutoShoutout
- Display-/Video-Queue
- offizieller Twitch-Shoutout
- eingehende/ausgehende Twitch-Shoutout-Events
- gemeinsame Texte, Settings, Diagnose und History

## Verbindliche Standards für weitere Schritte

Alle weiteren Arbeiten am Shoutout-System müssen sich an den bestehenden Projektstandards orientieren.

### 1. Datenbank-Standard

- Die bestehende Datenbank wird erweitert, nicht ersetzt.
- Die aktive SQLite-Datenbank `D:\Streaming\stramAssets\data\sqlite\app.sqlite` darf niemals überschrieben oder neu gebaut werden.
- Schemaänderungen nur sanft:
  - `CREATE TABLE IF NOT EXISTS`
  - `CREATE INDEX IF NOT EXISTS`
  - Spaltenmigration über bestehende Helper/Pattern wie `ensureTableColumn`
- Bestehende Daten, Tabellen und History nicht löschen, außer es ist ausdrücklich gewünscht.
- Neue DB-Logik soll möglichst portabel bleiben und spätere MariaDB-Unterstützung nicht unnötig blockieren.
- Keine neue Parallel-Datenbank für Shoutout/AutoShoutout.
- Bestehende Tabellen wie `clip_shoutout_display_queue`, `clip_shoutout_official_queue`, `clip_shoutout_auto_*` und `module_text_variants` bleiben die Grundlage.

### 2. Helper-Standard

Vor neuen Eigenlösungen müssen vorhandene Helper geprüft und genutzt werden.

Relevante Helper/Module:

- `../core/database`
- `./helpers/helper_config`
- `./helpers/helper_texts`
- `./helpers/helper_core`
- `./helpers/helper_messages`
- `./helpers/helper_routes`
- `./helpers/helper_cooldown`
- `./helpers/helper_queue` sofern passend
- `./communication_bus`
- `./stream_status`
- `./twitch`
- `./twitch_presence`

Regel:

- Keine neuen Parallelstrukturen für Config, Texte, Queue, Cooldowns oder Status bauen, wenn ein vorhandener Helper geeignet ist.
- Falls ein Helper nicht passt, erst begründen und dokumentieren, bevor neue Logik entsteht.

### 3. Config-Standard

- Keine neuen hart codierten Einstellungen, wenn sie im Dashboard oder in Config/DB sinnvoll pflegbar sein sollten.
- JSON bleibt Seed/Fallback/technische Basis.
- Persistente Laufzeit-/Dashboard-Settings sollen bevorzugt über DB/Settings-Helper laufen.
- Pfade, Cooldowns, Texte, Aktivierungen, Live-/Scene-Gates und Queue-Regeln müssen konfigurierbar bleiben.
- Änderungen müssen rückwärtskompatibel mit bestehender `config/clip_system.json` bleiben.

### 4. Text-Standard

Alle ausgebbaren Texte sollen langfristig über den Textvarianten-Standard laufen:

- DB-basiert über `module_text_variants`
- gepflegt über `helper_texts`
- mehrere Varianten pro Text-Key
- Kategorie-basiert im Dashboard
- alte Config-Texte bleiben als Seed/Fallback erhalten

Geplante Kategorien:

```text
shoutout.chat
shoutout.auto
shoutout.official
shoutout.system
```

Geplante spätere Text-Keys:

```text
shoutout.chat.accepted
shoutout.chat.waiting
shoutout.chat.duplicate
shoutout.chat.failed

shoutout.auto.greeting
shoutout.auto.queued
shoutout.auto.alreadyQueued
shoutout.auto.waitingStartScene
shoutout.auto.cooldown
shoutout.auto.disabled

shoutout.official.queued
shoutout.official.sent
shoutout.official.duplicate
shoutout.official.cooldown
shoutout.official.failed

shoutout.system.targetCleared
shoutout.system.queueReset
shoutout.system.dryRunNotice
```

Wichtig:

- Der alte Key `auto.greeting` darf nicht hart entfernt werden.
- Migration/Fallback muss sanft erfolgen.
- Der gemeinsame Dashboard-Tab `Texte` kommt später als eigener Step.

### 5. EventBus-/Monitoring-Standard

- Shoutout-Aktionen sollen relevante Events über den bestehenden Bus senden.
- Status-/Diagnose-Felder sollen einheitlich und dashboardfähig bleiben.
- Keine stillen Fehler: relevante Fehler müssen in Statusfeldern sichtbar sein.
- Events und Status sollen später für Monitoring/Recovery nutzbar sein.

Wichtige Eventbereiche:

```text
shoutout.display.*
shoutout.official.*
shoutout.auto.*
shoutout.command.*
shoutout.system.*
```

### 6. Dashboard-Standard

Das Dashboard soll neu organisiert werden, aber modular bleiben.

Geplante Zielstruktur:

```text
Übersicht
Chat-Shoutout
AutoShoutout
Queues
Texte
Verlauf
Statistik
Eingehend
Diagnose
Einstellungen
```

Regeln:

- Alltag und Diagnose trennen.
- Texte eigener gemeinsamer Tab.
- AutoShoutout bleibt Teil des Shoutout-Systems, nicht eigenes isoliertes System.
- Chat-Shoutout ist der Begriff für `!so`/`!vso`/Dashboard-Auslösung.
- Technische Tabs wie Produktion/Live-Test sollen in Diagnose aufgehen.
- Bestehende Funktionalität darf nicht entfernt werden.

## Abgrenzung dieses Steps

Dieser Step ändert nicht:

- Backend-Code
- Dashboard-Code
- Datenbank-Schema
- Config-Dateien
- Texte in der DB

Dieser Step dokumentiert nur die verbindlichen Standards und die Umbau-Leitplanken.

## Nächster geplanter Step

Vorschlag:

```text
CAN-44.16 – Shoutout Text Inventory & Text-Key Migration Plan
```

Ziel:

- alle aktuell vorhandenen Shoutout-Texte erfassen
- Ursprung je Text festhalten: Config, Default, DB, Helper
- Ziel-Key nach neuem Textstandard planen
- Migration/Fallback definieren
- danach erst gemeinsamer Texte-Tab
```
