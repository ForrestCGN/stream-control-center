# CURRENT_STATUS_EVENT_SYSTEM_EVS49_12

Stand: 2026-06-18

## Projekt
`stream-control-center` / Bereich `stream_events` / Event-System / EventSound Runtime / Winner-Finale-Overlay.

## Wichtigster aktueller Stand

EVS43 ist bestätigt:
- `stream_events` nutzt für RuntimeGate den Stream-State aus `twitch_events.getStreamState()`.
- Manual Online Override wird korrekt als online erkannt.
- Chat-Evaluation wird bei Override aktiv.
- Sound-Schnipsel wurde danach korrekt gelöst und Score/Points wurden geschrieben.

EVS44 ist bestätigt:
- Stream offline führt nicht mehr in einen klebenden manuellen Pausemodus.
- Event geht in `stream_offline_waiting`.
- Bei Online-Rückkehr geht das Event automatisch zurück nach `waiting`.
- Nächste Auto-Wartezeit wird normal geplant.
- Dashboard-Button „Wartezeit überspringen“ ist nur sichtbar, wenn:
  - Runtime aktiv
  - Phase `waiting`
  - Stream online

## Winner-Finale-Overlay

Der alte CSS/Card-Look war nicht CGN genug. Danach wurden mehrere Raster-Grafik-/Mapping-Versuche gemacht.

Aktueller Arbeitsstand:
- Hintergrundgrafik ist Raster-/PNG-basiert.
- Ziel: grafischer CGN-Neon-/Galaxy-Look als Hintergrund, HTML nur für Inhalte.
- Aktueller Asset-Pfad:
  - `htdocs/assets/stream_events/winner_finale_bg_1920x1080.png`
- Overlay:
  - `htdocs/overlays/stream_events/event_winner_overlay.html`

## EVS49.12 Versuch

EVS49.12 sollte Slot-Schablonen/Template-Layout einführen:
- Header-Schablone
- Top-3-Schablonen
- Honor 4–10-Schablonen
- Debug-Modi `debug=boxes`, `debug=boxes&grid=1`

Problem:
- Nach Einspielen zeigte die Test-URL nur schwarzen Hintergrund.
- URL im Screenshot:
  - `http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?debug=boxes&grid=1&v=4912`
- Vermutung: Der Boxenmodus rendert keine Inhalte, wenn kein `demo=...` oder `state=final` gesetzt ist, oder ein JS-Fehler verhindert Rendering.
- Nicht als stabil betrachten.
- EVS49.12 darf nicht als final übernommen werden, bevor die Anzeige wieder sichtbar ist.

## Wichtig: Aktueller Overlay-Zustand ist nicht fertig

Nicht produktiv fertig:
- Slotpositionen sind noch nicht final.
- Header passt noch nicht perfekt in den Rahmen.
- Top-3-Inhalte müssen sauber in komplette Schablonen/Kacheln.
- Honor-Slots unten müssen über vollständige Slot-Schablonen ausgerichtet werden.
- Lange Namen müssen innerhalb ihrer Schablone verkleinert oder per Marquee laufen.

## Bisherige sinnvolle Erkenntnis

Nicht mehr einzelne Texte frei platzieren.

Richtiger Ansatz:
1. Hintergrundgrafik bleibt.
2. Für jeden grafischen Rahmen eine komplette HTML/CSS-Schablone erstellen.
3. Innerhalb der Schablone feste Bereiche definieren:
   - Avatar
   - Name
   - Punkte
   - Reward
4. Debug-Modus soll zuerst nur komplette Schablonen zeigen, nicht echte Texte.
5. Erst wenn die Schablonen sitzen, echte Texte/Avatare wieder aktivieren.

## Nächste Priorität

Sofort im nächsten Chat:
1. EVS49.12 Fehler analysieren: Warum bleibt die Seite schwarz?
2. Nicht weiter blind mappen.
3. Erst eine minimal sichtbare Debug-Version bauen:
   - Hintergrund immer sichtbar
   - Slot-Schablonen sofort sichtbar, auch ohne Demo-Daten
   - keine Animation nötig
4. Danach Schablonen auf Hintergrund ausrichten.
5. Danach Text/Avatar-Inhalte wieder rein.
