# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestaetigter Arbeitsstand

```text
STEP BUS-TWITCH.1 – Twitch Events Central Foundation vorbereitet
```

## Twitch Events / Communication Bus

Neu vorbereitet:

```text
- Modul: twitch_events
- Datei: backend/modules/twitch_events.js
- Runtime-Version: 0.1.0
- Build: BUS_TWITCH_1
- Statusroute: /api/twitch/events/status
- Katalogroute: /api/twitch/events/catalog
- Bus-Anmeldung: vorbereitet
- Heartbeat: vorbereitet
- ACK/Replay: technisch vorbereitet, default deaktiviert
```

Ziel:

```text
Twitch-Events zentral normalisieren und ueber den Communication Bus abonnierbar machen.
Bestehende produktive Flows bleiben aktiv.
Alte Direktlogik wird erst entfernt, wenn ein Modul erfolgreich abonniert, getestet und dokumentiert wurde.
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
Keine bestehenden Twitch-/Presence-/Alert-/VIP30-Flows in BUS-TWITCH.1 entfernt.
Streamer.bot ist fuer dieses System aussen vor.
```
