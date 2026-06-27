# EVS52.21 – Winner Finale Replay Button

Stand: Dashboard-Ergänzung nach EVS52.19/EVS52.20.

## Ziel

Wenn ein Gewinner-Finale bereits existiert, aber nicht aktiv sichtbar ist, soll im Dashboard ein eigener Button erscheinen:

- `🔁 Auswertung erneut abspielen`

Dieser Button startet kein neues Losen, sondern nutzt die vorhandene Finale-/Winner-Struktur erneut und schickt sie nochmal ans Overlay.

## Regeln

- Noch kein Finale, Event finished, Ranking vorhanden: `🏆 Auswertung starten`
- Finale aktiv: `⏹ Finale beenden`
- Finale existiert, aber ist nicht aktiv: `🔁 Auswertung erneut abspielen`

## Geänderte Datei

- `htdocs/dashboard/modules/stream_events.js`

## Mitgelieferte aktuelle Datei

- `htdocs/overlays/stream_events/event_winner_overlay.html` aus EVS52.20, damit der No-Restart-Loop-Fix beim Entpacken nicht verloren geht.

## Nicht geändert

- keine Punkte-/Ranking-Logik
- keine Chat-/Sound-/Satz-Logik
- keine Datenbank
- kein neues Auslosen beim Replay
