# STEP LWG-4O.0a – Chat-Bus-Bridge Architekturentscheidung

Stand: 2026-06-09
Bereich: Loyalty / Giveaways / Chat-Events / Communication Bus
Status: Plan-/Architektur-Step, keine Codeänderung

## Ausgangslage

`twitch_presence` ist bereits die zentrale Twitch-IRC-/Bot-Quelle für normale Chatnachrichten. Das Modul empfängt IRC-Zeilen, parsed `PRIVMSG`, speichert Presence-/Aktivitätsdaten und ruft aktuell das Command-System direkt über `commands.handleChatMessage(...)` auf.

Das Command-System verarbeitet normale Chatnachrichten nur dann weiter, wenn sie ein Command sind. Normale Chatnachrichten werden aktuell nicht allgemein als Communication-Bus-Event veröffentlicht.

## Zielbild

Der Communication Bus soll künftig die zentrale, modulübergreifende Verteilung für Chat-Events übernehmen, ohne bestehende Commands zu beschädigen.

Geplante Kette:

```text
twitch_presence empfängt PRIVMSG
→ Presence/Aktivität bleibt unverändert
→ bestehender direkter Command-Aufruf bleibt zunächst unverändert
→ zusätzlich leichtes Bus-Event twitch.chat.message
→ Module reagieren nur bei Bedarf
```

## Warum zusätzlich und nicht direkt ersetzen?

Der direkte Command-Aufruf ist bestehende Funktionalität und darf nicht entfernt werden. Die Bus-Brücke wird deshalb zunächst ergänzend eingebaut. Erst wenn die Bus-Verteilung stabil getestet ist, kann später geprüft werden, ob das Command-System ebenfalls als Bus-Subscriber arbeitet.

## Vorgaben für Chat-Bus-Events

Chat darf den Bus nicht überlasten. Deshalb gelten für normale Chatnachrichten folgende Regeln:

```text
replayable: false
requireAck: false
ttlMs: 0 oder sehr kurz
kein Payload-Audit
kein Broadcast an alle UI-/Overlay-Clients
target nur Backend/Module/Capability
Payload minimal halten
```

Minimaler Payload-Vorschlag:

```json
{
  "provider": "twitch_irc",
  "source": "twitch_presence",
  "channel": "forrestcgn",
  "userLogin": "exampleuser",
  "userDisplayName": "ExampleUser",
  "userId": "",
  "message": "Hallo Chat",
  "badges": {},
  "roles": {
    "broadcaster": false,
    "mod": false,
    "vip": false,
    "subscriber": false
  },
  "receivedAt": "2026-06-09T00:00:00.000Z"
}
```

## Giveaway-Meldepflicht

Für die spätere optionale Meldepflicht im normalen Giveaway soll `loyalty_giveaways` nicht direkt an `twitch_presence` gekoppelt werden.

Geplanter Ablauf:

```text
Giveaway wartet auf Gewinner-Meldung
→ Chatmessage kommt über Bus
→ loyalty_giveaways prüft nur aktive Claim-Fenster
→ wenn userLogin == aktueller Gewinner: Gewinner bestätigt
→ sonst ignorieren
```

Wichtige Folgeevents können höherwertig sein als normale Chatnachrichten:

```text
twitch.chat.message          = normales, leichtes Chat-Event
giveaway.claim.detected      = wichtiges internes Treffer-Event
giveaway.claim.confirmed     = bestätigter Gewinnerstatus, optional replayable
```

## Bus-Last / Prioritäten – später einplanen

Ein späteres Bus-Prioritätssystem wird ausdrücklich eingeplant, aber in diesem Step nicht umgesetzt.

Vorgeschlagene Prioritäten:

```text
P0 kritisch: System/Recovery/Fehler/Watchdog
P1 wichtig: Giveaway-Claim, Rad-Berechtigung, Commands
P2 normal: Chat-Events, Presence, Aktivität
P3 niedrig: UI-/Statistik-/Debug-Events
```

## Nicht Bestandteil dieses Steps

```text
- Keine Codeänderung.
- Keine neue Twitch-Verbindung.
- Keine EventSub-channel.chat.message-Umstellung.
- Keine Entfernung des direkten Command-Aufrufs.
- Keine Giveaway-Claim-Logik.
- Keine neue Queue-/Priority-Implementierung.
- Keine Streamer.bot-Anbindung.
```

## Nächste technische Umsetzung

```text
LWG-4O.0b – twitch_presence veröffentlicht PRIVMSG zusätzlich als leichtes Bus-Event
```

Dabei zuerst echte aktuelle Dateien prüfen:

```text
backend/modules/twitch_presence.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
backend/modules/commands.js
backend/modules/loyalty_giveaways.js
```

## Testidee für LWG-4O.0b

```text
1. Node Syntaxcheck für twitch_presence.js
2. Bot-Verbindung unverändert prüfen
3. Command-Ausführung weiterhin prüfen
4. Bus-Status prüfen
5. Test-Subscriber oder Diagnose-Endpunkt prüfen, ob twitch.chat.message ankommt
6. Sicherstellen: keine Replay-/ACK-Flutung, keine UI-Broadcasts
```
