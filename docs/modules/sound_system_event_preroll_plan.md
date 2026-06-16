# Modul-Plan: Sound-System EventSound + Countdown-PreRoll

Stand: 2026-06-16

## Zweck

Dieses Dokument hält den Plan fest, wie Eventsystem-Sounds später sicher über das bestehende Sound-System laufen sollen, ohne bestehende Sound-/Alert-/UserSound-Flows zu beschädigen.

## Harte Grundregel

```text
Das bestehende Sound-System muss wie bisher weiterlaufen.
Neue EventSound-/Countdown-Funktion ist optional und additiv.
Keine bestehende Route darf ihr altes Verhalten ändern, wenn neue Felder fehlen.
```

## Warum über Sound-System?

Event-Sounds und Countdown müssen über die zentrale Queue laufen, damit nichts kollidiert:

```text
- Alerts
- User-Sounds
- Event-Sounds
- Countdown vor Event-Sounds
- spätere Auflösungs-Videos
```

Countdown darf nicht separat vom Eventsystem gestartet werden, weil sonst Sound-Queue und Countdown auseinanderlaufen könnten.

## Geplanter Ablauf

```text
stream_events:
1. Event läuft.
2. Mod/Streamer klickt „Nächsten Schnipsel abspielen“.
3. stream_events wählt Schnipsel und erstellt Runde.
4. stream_events sendet Sound-Job an Sound-System.

sound_system:
1. legt Job in Queue.
2. Wenn Job dran ist:
   - optional Countdown-PreRoll anzeigen.
   - Countdown 3 → 2 → 1.
   - Sound abspielen.
3. meldet Status/Ende zurück oder stellt Status bereit.

stream_events:
1. startet Antwortphase ab Soundstart.
2. prüft Chatantworten über twitch.chat.message.
3. bucht Punkte bei Treffer.
```

## Geplante additive Payload

```json
{
  "mediaId": "1496",
  "source": "stream_events",
  "category": "event_sound",
  "priority": 55,
  "preRoll": {
    "type": "countdown",
    "enabled": true,
    "seconds": 3,
    "style": "cgn"
  },
  "meta": {
    "eventUid": "...",
    "roundUid": "...",
    "snippetUid": "..."
  }
}
```

## Kompatibilitätsregeln

```text
preRoll fehlt:
  altes Verhalten

preRoll.enabled !== true:
  altes Verhalten

preRoll.seconds ungültig:
  Fallback 3 oder Countdown deaktivieren, aber Sound nicht blockieren

source/category/meta fehlen:
  altes Verhalten

EventSound-Job fehlerhaft:
  klare Fehlermeldung, keine Sound-System-Queue beschädigen
```

## CGN-Countdown Overlay

Stil:

```text
- Neon-Lila/Blau
- CGN-/ForrestCGN-Look
- großer Countdown 3 / 2 / 1
- optionaler Ring-/Pulseffekt
- keine Lösung / kein Schnipselname anzeigen
```

Text:

```text
Nächster Sound startet in...
3
2
1
```

Wichtig:

```text
Das Overlay ist Teil des Sound-System-Jobs.
Es wird nicht separat von stream_events gestartet.
```

## Offene Entscheidungsfragen

Vor Umsetzung klären:

```text
- Welche Priorität haben Event-Sounds gegenüber Alerts?
- Warten Event-Sounds immer auf laufende Sounds?
- Blockieren Event-Sounds User-Sounds?
- Gibt es bereits eine Sound-System-Kategorie für Event-Sounds?
- Gibt es vorhandene Status-/Callback-Events, an die stream_events hängen kann?
```

Empfehlung:

```text
Event-Sounds warten auf laufende Sounds.
Wenn Event-Sound läuft, blockiert er andere Event-Sounds/User-Sounds.
Keine Überschneidung.
Alles über Queue.
```

## Nächste Steps

```text
SOUND-SAFE-1:
Sound-System prüfen und Erweiterungspunkt festlegen.

SOUND-SAFE-2:
Optionalen Countdown-PreRoll additiv einbauen.

EVENTSYS-27E:
stream_events nutzt Sound-System für EventSound-Playback.
```
