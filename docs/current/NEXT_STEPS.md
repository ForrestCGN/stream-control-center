# NEXT_STEPS – stream-control-center

Stand: 2026-06-16

## Neuer Chat / nächster Startpunkt

```text
SOUND-SAFE-1 – Sound-System prüfen und sicheren Erweiterungspunkt für EventSound + Countdown-PreRoll festlegen
```

## Ausgangslage

```text
EVENTSYS-27D-FIX2 ist der aktuelle Arbeitsstand.
Live-Bedienung ist in der Übersicht sichtbar.
Sound-Runden können vorbereitet werden.
Echtes Playback ist noch nicht angebunden.
Countdown-Overlay ist gewünscht, muss aber über das Sound-System laufen.
Das alte Sound-System darf nicht kaputtgehen.
```

## Wichtigste Regel für den nächsten Block

```text
Keine direkte Eventsystem-Audioausgabe bauen.
Keinen Countdown am Sound-System vorbei triggern.
Keine zweite Queue bauen.
Keine bestehende Sound-System-Route in ihrem Verhalten brechen.
Neue Felder müssen optional sein.
Fehlen neue Felder, läuft alles wie bisher.
```

## Schritt 1 – Sound-System wirklich prüfen

Benötigte Dateien aus aktuellem Stand prüfen:

```text
backend/modules/sound_system.js
htdocs/overlays/sound_system_overlay.html
ggf. htdocs/overlays/js/ws-client.js
backend/modules/media*.js
backend/modules/stream_events.js
```

Ziel:

```text
- vorhandene Queue-Logik verstehen
- vorhandene /api/sound/play Payload verstehen
- vorhandene Overlay-Ausgabe verstehen
- prüfen, ob Media-IDs direkt abgespielt werden
- prüfen, welche Status-/Callback-/Bus-Signale existieren
```

## Schritt 2 – Kompatiblen EventSound-Job planen

Geplante additive Payload, nur wenn vom vorhandenen Sound-System sauber unterstützt oder gefahrlos ergänzt:

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
preRoll fehlt -> altes Verhalten
preRoll.enabled !== true -> altes Verhalten
source/category/meta fehlen -> altes Verhalten
```

## Schritt 3 – Erst danach bauen

Empfohlene Reihenfolge:

```text
SOUND-SAFE-1
Sound-System prüfen und Erweiterungspunkt dokumentieren.

SOUND-SAFE-2
Optionalen Countdown-PreRoll im Sound-System additiv einbauen.
Altes Verhalten muss unverändert bleiben.

EVENTSYS-27E
stream_events nutzt Sound-System-Queue für Event-Sounds.
Button wird von „Nächsten Schnipsel vorbereiten“ zu „Nächsten Schnipsel abspielen“.

EVENTSYS-27F
Antwortphase/Timer starten, nachdem Sound-System den Soundstart meldet oder der Job erfolgreich gestartet wurde.

EVENTSYS-27G
Chat-Antworten über twitch.chat.message prüfen und Punkte buchen.

EVENTSYS-27H
Chat-Ausgaben über helper_texts/helper_messages mit CGN-Heimleitung-Rentner-Textvarianten.

EVENTSYS-27I
Auflösungs-Video nach richtiger Antwort über Media-/Sound-System.

EVENTSYS-27J
Auto-Rotation: zufällig alle X ± Y Minuten.

EVENTSYS-DOCS-2
Doku nach Sound-System-Anbindung aktualisieren.
```

## Nicht tun

```text
Keine direkte Audioausgabe aus stream_events.
Kein Countdown-Overlay separat am Sound-System vorbei.
Keine neue Sound-Queue.
Keine bestehenden Sound-Routen brechen.
Keine alten Alert-/Sound-/UserSound-Flows verändern.
Kein Auto-Timer, bevor manuelles Playback stabil ist.
Kein Chat-Live-Send.
Keine produktive DB ersetzen.
```
