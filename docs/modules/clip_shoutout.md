# Modul-Doku: clip_shoutout

## Zweck

`clip_shoutout` verwaltet das ForrestCGN-Shoutout-System:

- manuelle Shoutouts über `!so` / `!vso`
- Clip-/Overlay-Shoutout über DisplayQueue
- offiziellen Twitch-Shoutout über OfficialQueue
- AutoShoutout auf Basis von Chataktivität
- eingehende/ausgehende Twitch-Shoutout-Events
- Statistik/Timeline/Diagnose
- Dashboard-Settings

## Aktueller Stand

- Modulversion: **0.2.40**
- aktueller CAN-Stand: **CAN-44.21.41**
- Dokumentationsstand: **CAN-44.21.42**

## Commands

Die Command-Konfiguration liegt in `command_definitions`.

Aktiv erwartet:

- Hauptcommand: `so`
- Alias: `vso`
- effektive Trigger: `so`, `vso`
- `clipso` / `videoso` nicht mehr aktiv

Command/Alias/Rechte/Cooldowns werden im Commands-Dashboard gepflegt, nicht im Shoutout-Dashboard.

## Dashboard

Produktives Dashboard-Modul:

- `htdocs/dashboard/modules/shoutout_v2.js`
- `htdocs/dashboard/modules/shoutout_v2.css`

Anzeige im Dashboard: **Shoutout**

Altes Dashboard-Modul:

- `shoutout.js`
- `shoutout.css`

ist in der aktuellen `index.html` nicht mehr aktiv geladen.

## Settings

Shoutout-Settings sind editierbar über das Shoutout-Dashboard.

Command-relevante Werte werden nur angezeigt und bleiben im Commands-Dashboard.

Editierbare Bereiche:

- Modul aktiv/inaktiv
- Direct-Intake enabled
- Clip-Suche
- DisplayQueue
- OfficialQueue
- Streamtag-Sperre
- Streamstatus/Start-Szene
- AutoShoutout-Grundeinstellungen
- AutoShoutout-Sofort-Auslöser

## AutoShoutout

Normale Nachrichtenzählung:

- erste Nachricht zählt als 1.
- bei `minMessagesBeforeTrigger = 3` müssen nach der ersten Nachricht noch zwei weitere folgen.

Sofort-Auslöser:

- `instantTriggerMessagesEnabled`
- `instantTriggerBypassMinMessages`
- `instantTriggerMessages`

Standardliste:

- `!lurk`
- `!lurke`
- `lurk`

Diese Trigger sind für Streamer gedacht, die nur kurz lurken und keine weiteren Nachrichten schreiben.

## OfficialQueue

Wichtige Regel:

- Wenn Twitch den offiziellen Shoutout blockt, bleibt der Eintrag in der Queue.
- Manuelle Wiederholung darf erneut versuchen.
- Automatische Worker-Retrys sollen keinen Chatspam erzeugen.

## Bekannte offene Beobachtungspunkte

- AutoShoutout-Sofort-Auslöser im Streambetrieb testen.
- Save-Verhalten im Dashboard nach CAN-44.21.40/41 nochmals prüfen.
- OfficialQueue-Retry-Verhalten über längere Laufzeit beobachten.

## Nicht anfassen ohne neuen Auftrag

- Clip-Player/Playback.
- Sound-System-Overlay.
- produktive SQLite-Datenbank-Datei.
- bestehende Queue-Logik ohne konkreten Fehlernachweis.
