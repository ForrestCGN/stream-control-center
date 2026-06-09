# STEP LWG-4O.0b – Chat-Bus-Bridge Umsetzungsplan / Lastschutz

Stand: 2026-06-09
Bereich: Twitch Presence / Communication Bus / Commands / Loyalty Giveaways
Status: Plan-/Prüf-Step, keine Codeänderung

## Ergebnis der Prüfung

`twitch_presence` ist bereits die laufende Chatquelle. Das Modul verbindet sich per Twitch IRC WebSocket, parsed IRC-Zeilen, wertet `PRIVMSG` aus, speichert Presence-/Aktivitätsdaten und ruft das Command-System direkt auf.

Aktueller Ablauf:

```text
twitch_presence empfängt PRIVMSG
→ handleIrcActivity(parsed)
→ Presence/Aktivität wird aktualisiert
→ commands.handleChatMessage(parsed, { source: 'twitch_presence', channel: BOT_CHANNEL })
```

Das Command-System verarbeitet normale Nachrichten nur als Commands weiter. Normale Chatnachrichten sind aktuell noch kein allgemeines Bus-Event.

## Ziel für den späteren Code-Step

Die Chat-Bus-Bridge soll ergänzend eingebaut werden, nicht ersetzend.

```text
twitch_presence empfängt PRIVMSG
→ Presence/Aktivität bleibt unverändert
→ bestehender Command-Direktaufruf bleibt unverändert
→ zusätzlich leichtes Bus-Event twitch.chat.message
```

## Lastschutz-Regeln

Normale Chatmessages dürfen den Communication Bus nicht gefährden.

```text
channel: twitch.chat
action: message
replayable: false
requireAck: false
ttlMs: 0
kein Payload-Audit
kein Broadcast an alle Clients
Target: Backend-/Modul-Capability, nicht target all für UI/Overlays
Payload minimal
```

Empfohlener Payload:

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

## Empfohlene technische Umsetzung

Datei:

```text
backend/modules/twitch_presence.js
```

Geplante Ergänzungen:

```text
1. communication_bus importieren.
2. Lokalen Getter getPresenceBus() ergänzen.
3. Kleine Statuszähler ergänzen:
   - chatBusEnabled
   - chatBusEmitted
   - chatBusFailed
   - chatBusLastAt
   - chatBusLastError
4. Funktion emitChatMessageToBus(parsed, source) ergänzen.
5. Im PRIVMSG-Block nach handleIrcActivity(parsed) und vor/oder neben commands.handleChatMessage(...) emitten.
6. Bestehenden commands.handleChatMessage(...) unverändert lassen.
```

Wichtig: Der Emit darf den Chat-/Command-Pfad nicht blockieren. Fehler beim Bus müssen abgefangen werden und dürfen Commands nicht beschädigen.

## Empfohlene Event-Metadaten

```js
meta: {
  replayable: false,
  requireAck: false,
  ttlMs: 0
}
```

## Späteres Prioritätssystem

Nicht Bestandteil dieses Steps, aber verbindlich vorgemerkt:

```text
P0 kritisch: System/Recovery/Fehler/Watchdog
P1 wichtig: Giveaway-Claim, Rad-Berechtigung, Commands
P2 normal: Chat-Events/Presence
P3 niedrig: UI-/Statistik-/Debug-Events
```

## Warum keine direkte Giveaway-Kopplung?

`loyalty_giveaways` soll nicht direkt an `twitch_presence` gekoppelt werden. Das Giveaway-Modul soll später nur Bus-Events abonnieren und bei aktivem Claim-Fenster prüfen, ob der aktuelle Gewinner geschrieben hat.

```text
twitch.chat.message
→ loyalty_giveaways prüft nur aktive Claim-Fenster
→ Treffer erzeugt giveaway.claim.detected / giveaway.claim.confirmed
```

## Nicht Bestandteil dieses Steps

```text
- Keine Codeänderung.
- Keine Streamer.bot-Abhängigkeit.
- Keine EventSub channel.chat.message Umstellung.
- Keine Entfernung des direkten Command-Aufrufs.
- Keine Giveaway-Claim-Logik.
- Keine Priority-Queue-Implementierung.
```

## Nächster Code-Step

```text
LWG-4O.1 – Twitch Presence Chat-Bus-Bridge Code
```

Voraussetzung:

```text
- Aktuelle echte backend/modules/twitch_presence.js als Datei verfügbar machen oder aus Live/GitHub vollständig prüfen.
- Danach kleine, gezielte Änderung mit Syntaxcheck.
```

## Tests für LWG-4O.1

```powershell
node -c .ackend\modules	witch_presence.js
Invoke-RestMethod http://127.0.0.1:8080/api/twitch/presence/status
Invoke-RestMethod http://127.0.0.1:8080/api/communication/status
```

Zusätzlich im Stream/Chat:

```text
1. Normale Chatnachricht schreiben.
2. Prüfen, ob Presence messageCount steigt.
3. Prüfen, ob bestehende Commands weiter funktionieren.
4. Prüfen, ob Bus-Status keine Replay-/ACK-Flutung zeigt.
```
