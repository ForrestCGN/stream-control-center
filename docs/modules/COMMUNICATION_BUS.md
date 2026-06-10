# communication_bus – Modulkommunikation und Monitoring

Stand: 2026-06-10

## Zweck

Der Communication-Bus ist die zentrale interne Schicht für:

```text
- Modul-zu-Modul-Kommunikation
- Status-/Heartbeat-Meldungen
- zentrale Diagnose
- kontrollierte Event-Verteilung an abonnierende Module
```

Er ersetzt nicht automatisch jede direkte Kopplung, sondern stellt Events zentral bereit. Module abonnieren nur die Events, die sie brauchen.

## Grundprinzip

```text
Producer
→ communication_bus
→ Subscriber-Module
```

Nicht jedes Modul wertet jedes Event aus. Stattdessen melden Module gezielte Subscriptions an.

## Aktueller Twitch-Einsatz

### Chat Commands

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

### VIP30 Channelpoints

```text
Twitch EventSub channel.channel_points_custom_reward_redemption.add
→ twitch.js reliable parallel tap
→ twitch_events
→ communication_bus
→ vip30 TwitchEvents Subscriber
```

## Wichtige Design-Regeln

```text
Twitch-Events sind Input-Signale.
Kein pauschales ACK für Chat/Channelpoints.
Kein pauschales Replay für High-Frequency-Events.
Keine pauschale Queue für Twitch-Input-Events.
```

Für spätere koordinierte Aktionen sind eigene Result-/Lifecycle-Events vorgesehen, z. B.:

```text
vip30.decision.completed
alert.playback.started
alert.playback.completed
sound.queue.completed
```

Solche Events können später mit `correlationId` arbeiten.

## Monitoring

Bus-Clients liegen in der Communication-Statusroute unter:

```powershell
$b = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$b.status.clients
```

Beispielprüfung:

```powershell
$b.status.clients | Where-Object { $_.module -eq "twitch_events" }
```

## Subscriber-Regel

Ein Modul soll nur abonnieren, was es wirklich braucht.

Beispiel:

```text
commands → twitch.chat.message
vip30    → twitch.channelpoints.redemption.created
```

So vermeiden wir, dass jedes Modul stumpf alle Chat-/Twitch-Events prüfen muss.
