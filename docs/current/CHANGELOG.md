# CHANGELOG – stream-control-center

Stand: 2026-06-12

## 2026-06-12 – CAN44.31 AutoShoutout V2 Activity Bridge Docs

### Ergebnis

```text
AutoShoutout-Buspfad dokumentiert.
ShoutoutV2-Dashboard-Ursache dokumentiert.
CAN44.31 Bridge/Patch als aktueller Stand dokumentiert.
TODO/NEXT_STEPS/FILES/CURRENT_STATUS aktualisiert.
Handoff für nächsten Chat erstellt.
```

### Technische Erkenntnis

```text
Die sichtbare AutoShoutout-Seite im Dashboard wird von htdocs/dashboard/modules/shoutout_v2.js gerendert.
Die Datei htdocs/dashboard/modules/auto_shoutout.js wird zusätzlich geladen, war aber nicht der sichtbare Renderer.
CAN44.31 nutzt auto_shoutout.js als Bridge/Patch für die ShoutoutV2-Aktivitätskarte.
```

## 2026-06-12 – CAN44.31 AutoShoutout V2 Activity Bridge

### Ergebnis

```text
Bridge/Patch für ShoutoutV2-Aktivitätskarte erstellt.
Ziel: sichtbare Anzeige „Letzte AutoShoutout-Aktivität“ in ShoutoutV2 ersetzen.
Neue Anzeige: Zeit / Streamer / Status / Info.
Info-Button öffnet Detail-Modal mit Rohdaten.
```

### Dateien

```text
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/auto_shoutout.css
```

### Browser-Prüfung

```javascript
window.AutoShoutoutV2ActivityPatch?.build
// CAN44.31_AUTOSO_V2_ACTIVITY_MODAL_BRIDGE
```

## 2026-06-12 – CAN44.30 AutoShoutout Activity Modal

### Ergebnis

```text
Kompakte Aktivitätsliste mit Info-Modal in auto_shoutout.js vorbereitet.
Datei wurde korrekt vom Node-Server ausgeliefert.
Alle CAN44.30-Marker waren per Invoke-WebRequest sichtbar.
```

### Einschränkung

```text
CAN44.30 änderte die sichtbare ShoutoutV2-Ansicht noch nicht,
weil diese von shoutout_v2.js gerendert wird.
```

## 2026-06-12 – CAN44.29 AutoShoutout Loyalty-Style Bus Subscriber

### Ergebnis

```text
AutoShoutout-Subscriber an funktionierendes Pattern von loyalty_giveaways angepasst.
Subscription-ID: clip_shoutout:twitch.chat:message:auto_shoutout
channel: twitch.chat
action: message
capability: twitch.chat.message
```

### Live-Test

```text
autoBusReceived  = 4
autoBusDelivered = 4
autoBusErrors    = 0
autoTriggered    = 2
autoSkipped      = 0
lastResultReason = queued
```

## 2026-06-12 – CAN44.28 AutoShoutout Bus Capability Fix

### Ergebnis

```text
Capability von twitch.chat.message.consumer auf twitch.chat.message korrigiert.
Grund: Andere funktionierende Subscriber wie commands/loyalty_giveaways nutzen twitch.chat.message oder keine Capability.
```

## 2026-06-12 – CAN44.27 AutoShoutout Bus Subscriber

### Ergebnis

```text
clip_shoutout.js abonniert twitch.chat/message vom Communication Bus.
Direkter Chat-Wrapper bleibt als Fallback erhalten.
Status erweitert um busSubscriber und Bus-Stats.
```

## Vorheriger dokumentierter Stand

```text
LWG-4Q.12N – Final Gamble/Giveaways Cleanup Docs + Next Chat Prompt
```

Der Loyalty-/Gamble-Stand bleibt unverändert gültig. Diese CAN44-Dokumentation ergänzt den Shoutout-/AutoShoutout-Arbeitsstand.
