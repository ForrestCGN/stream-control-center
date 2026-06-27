# CURRENT_CHAT_HANDOFF – EVENTSYS 27D / Sound-Safe nächster Schritt

Stand: 2026-06-16

## Aktueller Stand

Der aktuelle Arbeitsstand ist:

```text
EVENTSYS-27D-FIX2 – Live-Bedienung in der Übersicht
```

Das Eventsystem ist bis zur manuellen Sound-Rundenvorbereitung aufgebaut. Der Nutzer möchte als nächstes Sound-Playback mit einem optionalen 3-2-1 Countdown im CGN-Stil, aber ausdrücklich über das bestehende Sound-System, damit die Queue und alte Sound-Flows nicht gestört werden.

## Bestätigt / wichtig

```text
- Live-Bedienung in der Übersicht ist sinnvoll und eingebaut.
- Eventverwaltung sieht aktuell gut aus.
- Sound-Schnipsel, MediaPicker, Event-Einstellungen, Kopieren, Umbenennen funktionieren nach letztem Stand.
- Vor echtem Playback muss weiter geplant und das Sound-System geprüft werden.
```

## Harte Nutzer-Vorgabe

```text
Nichts am alten Sound-System kaputtmachen.
Altes System muss weiterlaufen.
Neue EventSound-/Countdown-Funktion nur optional/additiv.
Wenn neue Felder fehlen, muss alles wie bisher funktionieren.
Countdown darf nicht am Sound-System vorbei laufen.
Alles Audio-Relevante über Sound-System/Queue.
```

## Nächster Schritt

```text
SOUND-SAFE-1 – Sound-System prüfen und Erweiterungspunkt festlegen
```

## Zu prüfende Dateien

```text
backend/modules/sound_system.js
htdocs/overlays/sound_system_overlay.html
backend/modules/media*.js
backend/modules/stream_events.js
```

Falls Overlay-/Media-Dateien anders heißen: echte Repo-Struktur prüfen, nicht raten.

## Ziel von SOUND-SAFE-1

```text
- aktuelle Sound-System-Routen dokumentieren
- Queue-/Busy-/Prioritätslogik verstehen
- /api/sound/play Payload verstehen
- Overlay-Ausgabe verstehen
- prüfen, wie Media-IDs abgespielt werden
- sicheren optionalen Erweiterungspunkt für preRoll/countdown finden
```

## Geplantes späteres Ziel

Optionaler EventSound-Job:

```json
{
  "mediaId": "...",
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

Kompatibilitätsregel:

```text
preRoll fehlt -> altes Verhalten.
preRoll.enabled !== true -> altes Verhalten.
source/category/meta fehlen -> altes Verhalten.
```

## Nicht bauen, bevor Sound-System geprüft ist

```text
Kein Eventsystem-Direktplayback.
Kein separates Countdown-Overlay am Sound-System vorbei.
Keine neue Sound-Queue.
Kein Auto-Timer.
Kein Auflösungs-Video.
Kein Chat-Live-Send.
```

## Empfohlene Reihenfolge

```text
1. SOUND-SAFE-1: prüfen und Plan bestätigen.
2. SOUND-SAFE-2: optionalen Countdown-PreRoll im Sound-System additiv einbauen.
3. EVENTSYS-27E: EventSound-Playback über Sound-System-Queue aus stream_events.
4. EVENTSYS-27F: Antwortphase/Timer.
5. EVENTSYS-27G: Chat-Antworten + Punkte.
6. EVENTSYS-27H: Chat-Ausgaben über helper_texts/helper_messages.
7. EVENTSYS-27I: Auflösungs-Video.
8. EVENTSYS-27J: Auto-Rotation.
```

## Wichtig für nächsten Chat

Vor Umsetzung immer:

```text
Ziel
Dateien
Änderung
Nicht geändert
Kompatibilitätsregel
Tests
Warte auf go
```

Keine Codeänderung ohne `go`.
