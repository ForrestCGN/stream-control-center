# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Nächster empfohlener Arbeitsbereich

```text
BUS-TWITCH.12 – Modul-Migrationsplan für Twitch-Events
```

Ziel: Nicht sofort weitere Produktivlogik umbauen, sondern zuerst die bestehenden direkten Twitch-Event-Abnehmer sauber erfassen.

## Mögliche nächste Kandidaten

### 1. Loyalty / Giveaways

```text
Eventquelle: twitch.chat.message
Ziel: Giveaway-Claim und Chat-Teilnahme über Bus-Subscriber vorbereiten.
Altlogik erst nach Test deaktivieren.
```

### 2. VIP30 / Channelpoints

```text
Eventquelle: twitch.channelpoints.redemption.created
Ziel: VIP30 als Subscriber vorbereiten.
Fulfill/Cancel bleiben fachliche Result-/Request-Flows, nicht Bus-ACK.
```

### 3. Alerts

```text
Eventquellen: twitch.follow.received, twitch.sub.received, twitch.raid.received, twitch.cheer.received
Ziel: Alerts erst parallel abonnieren, dann alte Weiterleitung entfernen.
Wichtig: Alert/Sound/Overlay-Koordination bleibt eigene Aktionsebene.
```

### 4. Shoutout / ClipShoutout / AutoShout

```text
Eventquellen: twitch.chat.message, twitch.shoutout.created, twitch.shoutout.received
Ziel: bestehende AutoShout-Logik nicht anfassen, bevor Subscriber stabil getestet ist.
```

## Technische nächste Prüfung

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/eventsub/chat/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/bus-chat/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/command-direct/status"
```

## Vor jeder weiteren Migration

```text
1. Echte aktuelle Datei aus Repo/Live prüfen.
2. Bestehenden Direktweg dokumentieren.
3. Neuen Subscriber parallel ergänzen.
4. Live-Test.
5. Erst danach Standard/Fallback ändern.
```
