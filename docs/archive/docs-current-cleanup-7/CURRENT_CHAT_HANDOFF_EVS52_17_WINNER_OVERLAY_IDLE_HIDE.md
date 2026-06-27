# CURRENT CHAT HANDOFF – EVS52.17 Winner-Overlay Idle-Hide

Stand: 2026-06-18

## Ziel

Das Gewinner-/Finale-Overlay darf in OBS nicht dauerhaft sichtbar sein. Ohne gestartete Auswertung muss es komplett transparent/unsichtbar bleiben.

## Änderung

Datei:

```text
htdocs/overlays/stream_events/event_winner_overlay.html
```

Umgesetzt:

- Body-Hintergrund auf transparent gesetzt.
- `#stage` standardmäßig unsichtbar (`opacity:0`, `visibility:hidden`).
- Overlay wird erst sichtbar, wenn `renderFinale(...)` durch Demo/Preview/EventBus/geladenes Finale ausgeführt wird.
- Debug-/Grid-/Box-Modus bleibt sichtbar.
- Neuer Preview-Modus:

```text
/overlays/stream_events/event_winner_overlay.html?preview=1
```

- OBS-Produktivlink bleibt:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html
```

Dieser Link ist jetzt im Idle-Zustand unsichtbar.

## Nicht geändert

- Keine Finale-/Ranking-Logik geändert.
- Keine Punktevergabe geändert.
- Keine Dashboard-Button-Logik geändert.
- Keine Chat-/Sound-/Satzlogik geändert.

## Tests

1. OBS-Quelle mit normalem Link laden.
   - Erwartung: komplett unsichtbar.
2. Preview-Link im Browser/OBS testen.
   - Erwartung: Demo-Layout sichtbar.
3. Auswertung über Dashboard starten.
   - Erwartung: Overlay wird sichtbar und spielt Finale.
