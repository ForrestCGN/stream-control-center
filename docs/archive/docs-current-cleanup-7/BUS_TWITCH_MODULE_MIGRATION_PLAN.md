# BUS-TWITCH Modul-Migrationsplan

Stand: 2026-06-10

## Aktueller bestätigter Ausgangspunkt

```text
BUS-TWITCH.10 bestätigt:
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

Aktive Standardwerte:

```text
twitch_events EventSub Chat Autostart = true
commands Bus-Chat-Subscriber Autostart = true
twitch_presence Command-Direktweg = default false / Fallback vorhanden
```

## Grundregel für alle weiteren Migrationen

```text
Keine Funktionalität entfernen.
Erst neues Event anbieten.
Dann Modul abonnieren.
Dann live testen.
Dann alten Direktweg per Schalter deaktivieren.
Erst später entfernen, wenn der Ersatz über mehrere Streams stabil war.
```

## Event-Policy

Twitch-Events bleiben Eingangssignale und werden standardmäßig leicht gehalten:

```text
requireAck=false
replayable=false
ttlMs=0
queued=false
```

ACK/Replay bleiben technisch vorbereitet, werden aber erst für echte Systemaktionen/Workflows genutzt, nicht für normale Twitch-Events.

## Priorisierte Migrationskandidaten

### Priorität 1 – Channelpoints / VIP30

Warum als nächstes:

```text
VIP30 nutzt Channelpoint-Redemptions und braucht fachliche Result-Events.
Hier ist eine klare Request/Result-Struktur sinnvoll:
redemption.created → VIP30 entscheidet → fulfill/cancel requested → fulfilled/canceled/failed
```

Ziel-Events:

```text
twitch.channelpoints.redemption.created
twitch.channelpoints.redemption.fulfill.requested
twitch.channelpoints.redemption.cancel.requested
twitch.channelpoints.redemption.fulfilled
twitch.channelpoints.redemption.canceled
twitch.channelpoints.redemption.failed
```

Migrationsschritte:

```text
BUS-TWITCH.13 – Channelpoints/VIP30 Event-Mapping prüfen
BUS-TWITCH.14 – VIP30 Subscriber parallel vorbereiten
BUS-TWITCH.15 – Fulfill/Cancel Result-Events stabilisieren
BUS-TWITCH.16 – alte Direktlogik nur deaktivierbar machen, nicht entfernen
```

Nicht sofort entfernen:

```text
bestehende Channelpoints-/VIP30-Verarbeitung
bestehende Twitch-API-Funktionen in twitch.js
bestehende Fulfill/Cancel-Mechanik
```

### Priorität 2 – Alerts / Subs / Bits / Raids / Follows

Warum danach:

```text
Alerts sind sichtbar und timingkritisch.
Twitch-Events sollen nur auslösen; die koordinierte Alert-/Sound-/Overlay-Session bleibt ein eigener Workflow.
```

Ziel-Events:

```text
twitch.follow.received
twitch.sub.received
twitch.resub.received
twitch.subgift.received
twitch.giftbomb.received
twitch.cheer.received
twitch.raid.received
```

Spätere Systemaktionen:

```text
alert.session.requested
alert.session.started
alert.sound.started
alert.overlay.started
alert.session.finished
alert.session.failed
```

Migrationsschritte:

```text
1. Bestehendes Alert-Event-Mapping aus twitch.js dokumentieren.
2. alert_system abonniert Twitch-Events parallel.
3. Testmodus mit Event-Counter und lastDecision.
4. Doppel-Alert-Schutz über correlationId/eventId.
5. Alte direkte Alert-Weiterleitung erst deaktivierbar machen.
```

### Priorität 3 – Loyalty / Glücksrad / Giveaways

Warum:

```text
Giveaways und Claims brauchen Chat-Events und ggf. Channelpoints.
Chat läuft jetzt bereits über EventSub/Bus; Loyalty kann gezielt abonnieren.
```

Ziel-Events:

```text
twitch.chat.message
twitch.channelpoints.redemption.created
loyalty.giveaway.claim.detected
loyalty.giveaway.claim.confirmed
```

Migrationsschritte:

```text
1. loyalty_giveaways Subscriber auf twitch.chat.message vorbereiten.
2. Nur bei aktivem Claim-Fenster prüfen.
3. Kein UI-Broadcast und kein Replay für normale Chatmessages.
4. Treffer erzeugt eigenes internes Loyalty-Event.
```

### Priorität 4 – Shoutout / ClipShoutout

Warum:

```text
Shoutout- und Chataktivitätslogik hängt aktuell teilweise an Chat-/Twitch-Daten.
Nach Commands/Loyalty kann AutoShout sauber als Subscriber arbeiten.
```

Ziel-Events:

```text
twitch.chat.message
twitch.shoutout.created
twitch.shoutout.received
```

Migrationsschritte:

```text
1. Chataktivität über twitch.chat.message konsumieren.
2. Bestehende AutoShout-Regeln unverändert lassen.
3. Entscheidungsdiagnose ergänzen: lastSeenLogin, lastDecision, matchedStreamer, blockReason.
4. Alte direkte Chatabhängigkeit erst nach erfolgreichem Test deaktivieren.
```

### Priorität 5 – Deathcounter / Streamstatus / Game Sync

Warum:

```text
Streamstatus und Channel-Updates sind weniger kritisch als Commands/VIP/Alerts, aber gut geeignet für Bus-Events.
```

Ziel-Events:

```text
twitch.stream.online
twitch.stream.offline
twitch.channel.updated
```

Migrationsschritte:

```text
1. Event-Mapping in twitch_events prüfen.
2. deathcounter_v2/stream_status parallel abonnieren.
3. Game-/Title-Sync testen.
4. alte Direktlogik deaktivierbar machen.
```

## Module, die vorerst nicht migriert werden

```text
message_rotator: sendet Chatnachrichten/API-seitig, ist kein Twitch-Event-Consumer.
chat_output/helper_chat_output: Output/Fallback, nicht EventSub-Consumer.
clips: nutzt Twitch API für Clip-Erstellung; bleibt API-Consumer.
hug_system: nutzt Twitch User Lookup; bleibt zunächst API-Consumer.
```

Diese Module dürfen später Bus-Status oder Result-Events nutzen, sind aber nicht die ersten Twitch-Event-Migrationsziele.

## Reihenfolge als nächster Arbeitsplan

```text
BUS-TWITCH.13 – Channelpoints/VIP30 Event-Mapping prüfen
BUS-TWITCH.14 – VIP30 Subscriber parallel vorbereiten
BUS-TWITCH.15 – VIP30 Fulfill/Cancel Result-Events testen
BUS-TWITCH.16 – Alert Event-Mapping vorbereiten
BUS-TWITCH.17 – alert_system Subscriber parallel vorbereiten
BUS-TWITCH.18 – Loyalty Claim Subscriber planen/umsetzen
```

## Testprinzip pro Modul

Für jedes migrierte Modul gilt:

```text
1. Statusroute zeigt Subscriber-Status.
2. Counter: received / processed / ignored / failed.
3. lastEventId / lastDecision / lastError vorhanden.
4. alter Direktweg bleibt initial aktiv oder als Fallback verfügbar.
5. Doppelausführung wird verhindert.
6. StepDone vor Live-Test.
```
