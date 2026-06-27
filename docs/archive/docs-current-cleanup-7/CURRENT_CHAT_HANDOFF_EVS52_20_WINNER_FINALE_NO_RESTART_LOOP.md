# EVS52.20 – Winner Finale No Restart Loop

Stand: Winner-Finale Overlay nach EVS52.19.

## Problem
Das Gewinner-Finale blieb sichtbar, aber die Reveal-Timeline wurde immer wieder neu gestartet. Dadurch wiederholten sich Header-Texte wie „Glückwunsch“, „Platz 1“ und „Platz 2“ laufend, obwohl der eigentliche Ablauf parallel weiterlief.

## Ursache
Das Overlay rendert ein aktives Finale erneut, wenn Poll/Bus denselben Finale-State nochmal liefern. Dadurch entstehen mehrere laufende Reveal-Timelines und mehrere Timeout-Ketten.

## Fix
- Overlay-Version 0.5.41 / EVS52.20.
- Gleiches aktives Finale wird nicht erneut gerendert.
- Aktive Finale-UID wird gemerkt.
- Latest-Poll ignoriert denselben aktiven Finale-State.
- Reveal-Timer werden beim echten neuen Rendern vorher sauber gelöscht.
- Manuelles Beenden bleibt weiterhin der einzige reguläre Hide-Weg.

## Betroffene Datei
- `htdocs/overlays/stream_events/event_winner_overlay.html`

## Nicht geändert
- Backend
- Dashboard
- Punkte/Ranking
- Finale-Auslosung
- Chat/Sound/Satz-System
