# Shoutout-System – Text Inventory & Migration

Stand: 2026-06-04 / CAN-44.16
Status: Planung / keine Code-Änderung

## Zweck

Diese Modul-Doku beschreibt den Textbestand und die geplante Migration für das gemeinsame Shoutout-System.

Das Ziel ist ein gemeinsamer Texte-Tab im Shoutout-Dashboard, ohne Parallelstrukturen und passend zu den Projektstandards.

## Systembereich

Das Shoutout-System besteht aus:

- Chat-Shoutout (`!so`, Alias u. a. `!vso`)
- AutoShoutout
- DisplayQueue / Clip-Shoutout
- offizieller Twitch-Shoutout
- EventSub-Shoutout-Ereignisse
- Dashboard-Status, Queue, Timeline, Statistik, Diagnose

## Aktuelle Textquellen

### Config-basierte Texte

Derzeit liegen viele Texte noch direkt in der Shoutout-Konfiguration:

```text
clipShoutout.chatMessage
displayQueue.acceptedMessage
displayQueue.waitingMessage
displayQueue.failedMessage
streamDayLimit.duplicateMessage
autoShoutout.queuedMessage
autoShoutout.messages.*
officialShoutout.*Message
```

### DB-/Helper-basierte Texte

Bereits vorhanden:

```text
module_text_variants
helper_texts
clip_shoutout / auto.greeting
```

`auto.greeting` ist aktuell der erste echte Shoutout-Text mit Varianten-Verwaltung.

## Ziel

Langfristig sollen alle ausgebbaren Shoutout-Texte über `helper_texts` und `module_text_variants` laufen.

Dabei gilt:

- Config-Werte bleiben zunächst Fallback
- bestehende Texte werden nicht gelöscht
- neue Textkeys liegen unter `shoutout.*`
- Kategorien werden im Dashboard sichtbar
- mehrere aktive Varianten pro Text-Key sind möglich

## Vorgeschlagene Kategorien

```text
shoutout.chat
shoutout.auto
shoutout.official
shoutout.dashboard
shoutout.system
```

## Vorgeschlagene Ziel-Keys

```text
shoutout.chat.accepted
shoutout.chat.waiting
shoutout.chat.started
shoutout.chat.failed
shoutout.chat.duplicate_stream_day
shoutout.auto.greeting
shoutout.auto.queued
shoutout.auto.already_queued
shoutout.auto.waiting_start_scene
shoutout.auto.cooldown
shoutout.auto.disabled
shoutout.official.queued
shoutout.official.sent
shoutout.official.failed
shoutout.official.cooldown
shoutout.official.waiting_live
shoutout.dashboard.saved
shoutout.dashboard.error
shoutout.system.scene_gate_waiting
shoutout.system.live_gate_waiting
```

## Migrationsregel

Neue Implementierung darf nicht hart von alten Config-Werten auf neue Keys umschalten.

Pflicht-Fallback-Reihenfolge:

```text
1. DB/Textvarianten
2. neue Default-Keys
3. Legacy-Config-Wert
4. statischer Notfall-Fallback
```

## Dashboard-Ziel

Der spätere Tab `Texte` soll:

- Kategorien anzeigen
- Text-Keys je Kategorie anzeigen
- Varianten anzeigen
- Varianten aktivieren/deaktivieren
- Varianten hinzufügen/bearbeiten/löschen
- Platzhalter erklären
- Änderungen erst nach Speichern übernehmen

## Keine Code-Änderung in CAN-44.16

Dieser Stand ist reine Bestandsaufnahme und Migrationsplanung.
