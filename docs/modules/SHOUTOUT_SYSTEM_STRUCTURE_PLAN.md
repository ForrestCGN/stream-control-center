# Shoutout-System – Strukturplan

Stand: 2026-06-04 / CAN-44.14

## Kurzfassung

Das Shoutout-System umfasst:

```text
Chat-Shoutout
AutoShoutout
DisplayQueue
OfficialQueue
Inbound/Outbound Twitch-Shoutout-Events
Timeline
Statistik
Textvarianten
```

Der Begriff **Chat-Shoutout** bezeichnet die direkte Auslösung per `!so` oder Dashboard.

## Zielstruktur Dashboard

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

## Gemeinsame technische Basis

Backend:

```text
backend/modules/clip_shoutout.js
```

Dashboard:

```text
htdocs/dashboard/modules/shoutout.js
htdocs/dashboard/modules/auto_shoutout.js
```

Config:

```text
config/clip_system.json
```

Datenbank:

```text
clip_shoutout_display_queue
clip_shoutout_official_queue
clip_shoutout_official_history
clip_shoutout_inbound_events
clip_shoutout_auto_settings
clip_shoutout_auto_streamers
clip_shoutout_auto_events
clip_shoutout_auto_message_activity
module_text_variants
```

## Nächste Schritte

1. Gemeinsamer Texte-Tab.
2. Dashboard-Tabs neu ordnen.
3. Text-Key-Struktur konsolidieren.
4. Verlauf/Timeline besser nach Quelle markieren.
