# CURRENT_STATUS – stream-control-center

Stand: 2026-06-17 16:20

## Aktueller Arbeitsstand

```text
EventSound / Runtime-Overlay / Sound-System ist der aktuelle Arbeitsblock.
Der Grundablauf Sound-Schnipsel → Antwortfenster → Gewinner-/Keine-Lösung-Anzeige ist grundsätzlich stabil.
```

## Bestätigt funktionierend

```text
- Sound-Schnipsel läuft hörbar über das Sound-System.
- Sound-System bleibt Playback-/Queue-Owner.
- Eventsystem/Runtime-Overlay startet Sound/Video nicht direkt am Sound-System vorbei.
- 3 Sekunden Countdown/PreRoll vor dem Sound funktioniert.
- Während Countdown und Sound werden Antworten nicht akzeptiert.
- Das Antwortfenster startet erst nach Sound-Ende.
- Kleiner runder Antwort-Counter wird während der Antwortphase angezeigt.
- Counter sitzt oben rechts und hat deckenden Hintergrund.
- Richtige Antwort wird erkannt.
- Punkte werden vergeben.
- Gewinner-Card erscheint Mitte rechts.
- Reveal-Video kann grundsätzlich über Sound-System-Overlay abgespielt werden.
- Bei Timeout erscheint eine eigene Keine-Lösung-Kachel oben mittig.
- Keine-Lösung-Kachel spoilert die Lösung nicht.
- Kein AUFLOESUNG-/LOS-/JETZT-RATEN-Kreis mehr beim Reveal.
- Auto-Schedule wurde korrigiert: random_auto/sequence_auto nutzt intervalMinutes ± intervalJitterMinutes; roundDelaySeconds ist nur Mindestpause/Floor.
```

## Aktuelle Versionen / Builds aus diesem Arbeitsstand

```text
stream_events: zuletzt dokumentierter Zielstand 0.5.51 / STEP_EVENT_RUNTIME_UNRESOLVED_CARD_1
sound_system: Reveal-Playback-only Fix aus STEP_EVENT_RUNTIME_OVERLAY_1B berücksichtigt
Runtime-Overlay: zuletzt über Overlay-Steps bis 0.3.7 erweitert
```

Hinweis: Bei Tests immer zuerst echte API-Version prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

## Relevante zuletzt gebaute Steps

```text
EVENT-RUNTIME-OVERLAY-1
- Gewinner-Card Mitte rechts.
- Reveal nach Gewinner-Card verzögert.
- AUFLOESUNG-Payload entfernt.

EVENT-RUNTIME-OVERLAY-1B
- Reveal-Playback über Sound-System ohne Runtime-PreRoll-Kreis.
- Kein LOS/JETZT RATEN/AUFLOESUNG beim Reveal.

EVENT-RUNTIME-ANSWER-COUNTDOWN-1
- Antwortzeit-Counter eingeführt.
- answerSeconds bis 3600 Sekunden vorbereitet.
- Counter nur während answerWindow.active.
- JETZT RATEN während Soundlauf entfernt.

EVENT-RUNTIME-ANSWER-COUNTDOWN-1B
- Counter nach oben rechts verschoben.
- Counter-Anzeige ruhiger gemacht.

EVENT-RUNTIME-UNRESOLVED-CARD-1
- Keine-Lösung-Kachel nach Timeout.
- Counter ohne Transparenz.
- Timeout-Result sichtbar 10 Sekunden.

EVENT-RUNTIME-POLISH-1 / 1B
- Keine-Lösung-Kachel optisch verbessert.
- Text aktualisiert:
  KEINE LÖSUNG
  Die Heimleitung hat im Chat
  keine richtige Antwort erkannt.
  Der Schnipsel bleibt im Archiv.

EVENT-RUNTIME-WINNER-CARD-LAYOUT-1
- Gewinner-Card robuster für lange Namen/Titel.
- Username eigene Zeile.
- Punkte eigene Zeile.
- Titel eigene zweizeilige Titelbox.

EVENT-RUNTIME-WINNER-CARD-DEMO-1
- Demo-URL für langen Namen/Titel ergänzt:
  /overlays/stream_events/event_runtime_overlay.html?demo=result-long&v=test
```

## Aktueller gewünschter Runtime-Ablauf Sound-Schnipsel

```text
1. Event/Auto-Intervall löst nächste Soundrunde aus.
2. Runtime-Overlay zeigt 3 / 2 / 1 / LOS.
3. Sound-System spielt den Schnipsel.
4. Während Sound: keine Antwortannahme, kein Jetzt-raten-Text.
5. Nach Sound-Ende startet answerWindow.
6. Counter oben rechts läuft.
7a. Richtige Antwort:
    - Counter weg.
    - Gewinner-Card Mitte rechts ca. 10 Sekunden.
    - danach Reveal-Video über Sound-System-Overlay.
    - danach weiter nach Auto-Intervall.
7b. Timeout / keine richtige Antwort:
    - Counter weg.
    - Keine-Lösung-Kachel oben mittig ca. 10 Sekunden.
    - kein Reveal.
    - keine Punkte.
    - Schnipsel bleibt ungelöst und kann je nach Config später wieder in Rotation.
```

## Bekannte Stolperfallen

```text
- Wenn Counter nicht erscheint: zuerst prüfen, ob answerWindow.active im Runtime-State true wird.
- Wenn alte Texte/Layouts sichtbar sind: Backend-Version, Live-Deploy und OBS-Browserquellen-Cache prüfen.
- Wenn Reveal-Video nicht sichtbar ist: Reveal läuft nicht über event_runtime_overlay.html, sondern über sound_system_overlay.html.
- Der falsche ZIP-Pfad aus einem früheren Step war ein bekannter Fehler. Korrekt ist:
  htdocs/overlays/stream_events/event_runtime_overlay.html
- Long-Winner-Test über Custom-Testevent war unzuverlässig; Layoutprüfung für lange Namen/Titel lieber über Demo-URL machen.
```

## Wichtige URLs / Testbefehle

```text
Runtime Overlay:
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html

Long Winner Demo:
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=result-long&v=test

Sound-System Overlay für Reveal-Videos:
http://127.0.0.1:8080/overlays/sound_system_overlay.html
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-overlay/state" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=10" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/event-preroll/status" | ConvertTo-Json -Depth 12
```

## Nächster sinnvoller Arbeitsblock

```text
1. Nicht weiter am Gewinner-/Keine-Lösung-Layout schrauben, solange es im Live-/Demo-Test ok aussieht.
2. Reveal-Video-Sichtbarkeit bei Bedarf separat über sound_system_overlay.html prüfen.
3. Danach EventSound Dashboard-/Config-Integration sauber weiterführen.
4. Doku/Projektstand nach jedem stabilen Test aktualisieren.
```
