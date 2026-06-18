# Modul-Doku – Stream Events

## Aktueller Stand EVS52.19

Backend-Datei: `backend/modules/stream_events.js`

- Version: `0.5.89`
- Build: `STEP_EVS52_19_WINNER_FINALE_MANUAL_END`

## Gewinner-Finale

Das Gewinner-Finale ist ab EVS52.19 ein manueller Dashboard-Zustand:

1. Beendetes Event mit Ranking zeigt `🏆 Auswertung starten`.
2. Beim Start wird das Finale gespeichert und ans Overlay gesendet.
3. Das Overlay bleibt sichtbar, auch wenn die Reveal-Timeline fertig ist.
4. Im Dashboard erscheint nur während aktivem Finale `⏹ Finale beenden`.
5. Erst dieser Button blendet das Overlay aus.

### Endpunkte

- `GET /api/stream-events/events/:eventUid/finale`
  - liefert Preview, Ranking, Existing-Finale und Finale-Status.
- `POST /api/stream-events/events/:eventUid/finale/start?confirm=1`
  - startet neues Finale oder replayt bestehendes Finale.
- `POST /api/stream-events/events/:eventUid/finale/end?confirm=1`
  - beendet/verbirgt aktives Finale manuell.
- `GET /api/stream-events/winner-finale/latest`
  - liefert aktives/frisches Finale für OBS-Reload/Overlay-Start.

### Finale-Felder

- `winnerFinale.active`
- `winnerFinale.state`
- `winnerFinale.startedAt`
- `winnerFinale.replayAt`
- `winnerFinale.lastReplayAt`
- `winnerFinale.endedAt`
- `winnerFinale.hiddenAt`
- `metadata.winnerFinaleActive`
- `metadata.winnerFinaleEndedAt`
- `metadata.winnerFinaleHiddenAt`

## Nicht geändert

- Punktevergabe
- Sound-Schnipsel
- Satz-/Text-Spiel
- Chatquelle über Twitch-Events/Bus
- Bot-/Self-Filter
- DB-Schema
