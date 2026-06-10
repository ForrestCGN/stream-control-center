# CURRENT STATUS – stream-control-center

Stand: 2026-06-09

## Aktueller bestätigter Zusatzstand

```text
STEP AUTOSHOUT-HOTFIX.1 – AutoShout autoRawMessage/instantTrigger Fix bestätigt und dokumentiert
```

## Shoutout / AutoShout

Bestätigt:

```text
- Modul: clip_shoutout
- Runtime-Version: 0.2.42
- Fehler autoRawMessage is not defined behoben
- 2-Nachrichten-Regel getestet und erfolgreich
- !lurk als erste Nachricht getestet und erfolgreich
- lastError nach Test leer
```

Offen:

```text
- Testuser forrestcgn aus AutoShout-Liste entfernen, falls noch vorhanden
- papselzockt_ / papselzockt_cgn Login-Mismatch prüfen
- optionale Entscheidungsdiagnose später planen
```

## Loyalty / Glücksrad / Giveaways

Letzter dokumentierter Bereich bleibt separat weiterzuführen:

```text
STEP LWG-4K.2 – Static Chat Routes Order Fix bestätigt
LWG-4N.7 laut docs/current vorbereitet
```

## Wichtige Abgrenzung

```text
Keine produktive SQLite-Datei ersetzen.
Keine Queue-Logik ohne neuen Auftrag umbauen.
Keine Twitch-Presence- oder Streamer.bot-Logik in diesem Hotfix geändert.
```

## Twitch Events / Communication Bus

```text
STEP BUS-TWITCH.1 – Twitch Events Central Foundation bestaetigt.
STEP BUS-TWITCH.2 – Chat Parallel Bridge bereitgestellt.
```

Bestätigt/vorbereitet:

```text
- twitch_events laeuft als zentrale Twitch-Event-Schicht.
- ACK/Replay sind vorbereitet, aber fuer Twitch-Events standardmaessig aus.
- twitch_presence bleibt Chatquelle.
- commands.handleChatMessage(...) bleibt aktiv.
- PRIVMSG wird zusaetzlich als twitch.chat.message ueber twitch_events angeboten.
- Keine Altlogik entfernt.
```
