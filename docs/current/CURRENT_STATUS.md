# CURRENT_STATUS – stream-control-center

Stand: 2026-06-12

## Aktueller bestätigter Stand

```text
CAN44.31 – AutoShoutout Bus + ShoutoutV2 Activity Bridge dokumentiert
```

## Gesamtstand Shoutout / AutoShoutout

Der aktuelle Shoutout-Stand umfasst die erfolgreiche Umstellung des AutoShoutout-Pfads auf den zentralen Communication/EventBus sowie die Dashboard-Korrektur für die sichtbare AutoShoutout-Aktivitätsanzeige im ShoutoutV2-Dashboard.

## Bestätigter Runtime-Ablauf

```text
Twitch EventSub Chat
  → twitch_events.js
  → Communication Bus Event twitch.chat/message
  → clip_shoutout.js AutoShoutout-Subscriber
  → DisplayQueue / Video-SO
  → optional OfficialQueue / Twitch-SO
```

Bestätigter Live-Test:

```text
autoBusReceived  = 4
autoBusDelivered = 4
autoBusErrors    = 0
autoTriggered    = 2
autoSkipped      = 0
lastResultReason = queued
lastSourceModule = twitch_events_eventsub_chat
```

Damit ist der AutoShoutout-Buspfad funktional.

## Abgeschlossene CAN44-Schritte

### CAN44.27 – AutoShoutout Bus Subscriber

```text
clip_shoutout.js lauscht zusätzlich auf twitch.chat/message vom Communication Bus.
Direkter Chat-Wrapper bleibt als Fallback erhalten.
Doppelverarbeitung wird vermieden, wenn der Bus-Subscriber installiert ist.
```

### CAN44.28 – Capability Fix

```text
Subscription-Capability wurde von twitch.chat.message.consumer auf twitch.chat.message korrigiert.
Grund: Der Communication Bus matcht aktive Subscriber passend zu channel/action/capability.
```

### CAN44.29 – Loyalty-Style Bus Subscriber

```text
Subscription wurde an den funktionierenden Stil von loyalty_giveaways angepasst.
Subscription-ID: clip_shoutout:twitch.chat:message:auto_shoutout
channel: twitch.chat
action: message
capability: twitch.chat.message
```

Dieser Stand wurde live bestätigt.

### CAN44.30 – AutoShoutout Activity Modal in auto_shoutout.js

```text
auto_shoutout.js bekam eine kompakte Aktivitätsliste mit Info-Button und Detail-Modal.
Die Datei wurde korrekt über /dashboard/modules/auto_shoutout.js ausgeliefert.
```

Hinweis: CAN44.30 alleine änderte die sichtbare Shoutout-Seite nicht, weil die aktive AutoShoutout-Ansicht im Dashboard aus shoutout_v2.js gerendert wird.

### CAN44.31 – ShoutoutV2 Activity Bridge

```text
Die sichtbare ShoutoutV2-AutoShoutout-Karte wird per Bridge/Patch aus auto_shoutout.js nachgerüstet.
Dadurch wird die bisherige Anzeige "triggered · triggered" durch eine kompakte Liste mit Info-Modal ersetzt.
```

Build-Kennung im Browser:

```javascript
window.AutoShoutoutV2ActivityPatch?.build
// CAN44.31_AUTOSO_V2_ACTIVITY_MODAL_BRIDGE
```

## Dashboard-Zuständigkeit Shoutout

```text
htdocs/dashboard/modules/shoutout_v2.js
  → aktive sichtbare Shoutout-Hauptseite
  → Tabs: Übersicht, Shoutout, AutoShoutout, Queues, Texte, Auswertung, Diagnose, Einstellungen
  → rendert die sichtbare AutoShoutout-Karte mit Streamer-Verwaltung und Aktivitätsliste

htdocs/dashboard/modules/auto_shoutout.js
  → zusätzlich geladenes AutoShoutout-Modul
  → CAN44.31 Bridge/Patch für ShoutoutV2-Aktivitätskarte
  → kompakte Aktivitätsliste + Info-Modal
```

## Aktuelle AutoShoutout-Dashboard-Anzeige

Zielzustand für „Letzte AutoShoutout-Aktivität“:

```text
Zeit | Streamer | Status | Info
```

Info-Modal enthält:

```text
Streamer
Auslöser
Status
Kurzstatus
Grund
Zeit
DisplayQueue
Quelle
Chat-Nachricht
Stream-Day
Rohdaten aufklappbar
```

## Wichtige Erkenntnis aus dem Debugging

```text
Die sichtbare AutoShoutout-Seite wird nicht von AutoShoutoutModule.render() erzeugt.
Sie kommt aus ShoutoutV2Module / shoutout_v2.js.
Deshalb muss bei künftigen Shoutout-Dashboard-Änderungen zuerst geprüft werden,
welche Datei die sichtbare Ansicht tatsächlich rendert.
```

## Aktuelle relevante Dateien

```text
backend/modules/clip_shoutout.js
backend/modules/twitch_events.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
htdocs/dashboard/index.html
htdocs/dashboard/modules/shoutout_v2.js
htdocs/dashboard/modules/shoutout_v2.css
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/auto_shoutout.css
```

## Wichtige Projektregel

```text
Keine Funktionalität entfernen.
Bestehende echte Dateien/GitHub-dev als Single Source of Truth verwenden.
SQLite-Datenbank niemals ersetzen oder überschreiben.
Änderungen immer mit echten Zielpfaden im ZIP liefern.
Bei Dashboard-Anzeigen zuerst prüfen, welche Datei die sichtbare Ansicht rendert.
```
