# Shoutout-System – Standards Alignment

Stand: 2026-06-04 / CAN-44.15

## Zweck

Diese Datei ergänzt die Shoutout-System-Strukturdokumentation um verbindliche Projektstandards für den weiteren Umbau.

Das Shoutout-System ist ein gemeinsames System aus:

- Chat-Shoutout
- AutoShoutout
- Display-/Video-Queue
- offiziellem Twitch-Shoutout
- EventSub-Shoutout-Eingang/Ausgang
- gemeinsamer Text-, Config-, DB- und Dashboard-Verwaltung

## Begrifflichkeiten

### Chat-Shoutout

Auslösung über:

```text
!so
!vso
Dashboard-Auslösung
```

Nicht mehr bevorzugt:

```text
Manuelle Shoutouts
```

### AutoShoutout

Automatische Auslösung durch Chat-Aktivität konfigurierter Streamer.

### Offizieller Shoutout

Twitch-Helix/Send-Shoutout, der nach einem Display-/Video-Shoutout über die OfficialQueue ausgeführt wird.

## Architekturstandard

### Datenbank

- Nur bestehende Datenbank erweitern.
- Keine neue Shoutout-Datenbank.
- Keine destructive Migration ohne ausdrückliche Freigabe.
- DB-Zugriff über vorhandene Projektmechanismen.
- MariaDB-Kompatibilität bei neuer Logik mitdenken.

Aktuelle Kern-Tabellen:

```text
clip_shoutout_display_queue
clip_shoutout_official_queue
clip_shoutout_official_history
clip_shoutout_inbound_events
clip_shoutout_auto_settings
clip_shoutout_auto_streamers
clip_shoutout_auto_events
clip_shoutout_auto_message_activity
command_definitions
module_text_variants
```

### Config

- `config/clip_system.json` bleibt Seed/Fallback.
- DB-/Dashboard-Settings sind für laufende Konfiguration vorzuziehen.
- Keine neuen fest verdrahteten Werte, wenn sie konfigurierbar sein sollten.

### Texte

Langfristiges Ziel:

```text
alle Shoutout-Texte über helper_texts + module_text_variants
```

Dashboard-Ziel:

```text
Shoutout-System -> Texte
```

Text-Kategorien:

```text
shoutout.chat
shoutout.auto
shoutout.official
shoutout.system
```

### Helper

Vor jeder Umsetzung prüfen:

```text
helper_config
helper_texts
helper_core
helper_messages
helper_routes
helper_cooldown
helper_queue
database core
communication_bus
stream_status
twitch
twitch_presence
```

Keine Parallelhelper ohne dokumentierte Begründung.

### EventBus

Shoutout-System soll Status und Ereignisse sauber über den vorhandenen Bus melden.

Wichtige Bereiche:

```text
shoutout.display.*
shoutout.official.*
shoutout.auto.*
shoutout.command.*
shoutout.system.*
```

### Dashboard

Geplante neue Struktur:

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

Alltagsfunktionen nach vorne, technische Prüfungen nach hinten.

## Arbeitsregel

Vor weiteren Code-Änderungen:

1. echte aktuelle Datei prüfen
2. vorhandene Helper prüfen
3. Datenbank-/Config-/Textstandard abgleichen
4. keine Funktionalität entfernen
5. kleine Steps mit eindeutiger CAN-/STEP-Dokumentation
