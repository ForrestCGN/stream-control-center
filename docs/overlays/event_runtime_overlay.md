# Overlay-Doku – Event Runtime Overlay

Datei: `htdocs/overlays/stream_events/event_runtime_overlay.html`  
Stand: Overlay bis `0.3.7`  
Zuletzt aktualisiert: 2026-06-17

## Aufgabe

Das Event Runtime Overlay zeigt sichtbare Runtime-Zustände für EventSound:

```text
- Countdown 3 / 2 / 1 / LOS
- Antwort-Counter
- Gewinner-Card
- Keine-Lösung-Kachel
```

Das Overlay startet kein Audio und kein Video. Playback läuft über das Sound-System.

## Aktueller Ablauf

```text
Countdown: sichtbar oben mittig als Kreis
Sound läuft: Runtime-Kreis verschwindet, kein JETZT RATEN
Antwortfenster: Counter oben rechts
Richtig gelöst: Gewinner-Card Mitte rechts
Timeout: Keine-Lösung-Kachel oben mittig
Reveal: über sound_system_overlay.html, nicht über Runtime-Overlay
```

## Counter

```text
Position: oben rechts
Hintergrund: deckend, keine Transparenz
Inhalt: nur Zahl
Sichtbar: nur während answerWindow.active=true
```

Der Counter wird nicht während Countdown oder Soundlauf angezeigt.

## Gewinner-Card

```text
Position: Mitte rechts
Avatar/Initialen: ja
Username: eigene Zeile
Punkte: eigene Zeile
Titel: eigene Titelbox, maximal zwei Zeilen
```

Für lange Namen/Titel wurde das Layout robuster gemacht. Es soll nicht endlos breiter werden.

## Keine-Lösung-Kachel

```text
Position: oben mittig
Dauer: ca. 10 Sekunden
Ausrichtung: komplett zentriert
```

Text:

```text
KEINE LÖSUNG
Die Heimleitung hat im Chat
keine richtige Antwort erkannt.
Der Schnipsel bleibt im Archiv.
```

## Demo-URLs

Normales Overlay:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html
```

Debug:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?debug=1&v=test
```

Lange Gewinner-Card prüfen:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=result-long&v=test
```

## Fallback

Das Overlay nutzt weiterhin den Fallback über:

```text
GET /api/sound/event-preroll/status
```

Dieser Fallback darf die Antwortphase nicht überschreiben. `sound_guessing` wird nach `LOS` versteckt, damit während Soundlauf kein falsches „Jetzt raten“ erscheint.

## Wichtig

Wenn alte Anzeige sichtbar ist:

```text
1. Repo-Datei prüfen.
2. Live-Datei prüfen.
3. OBS-Browserquelle refreshen.
4. Cache-Buster an URL hängen.
5. Backend-Version prüfen.
```

Korrekte Datei im ZIP/Repo:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```
