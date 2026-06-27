# CURRENT CHAT HANDOFF – EVS52.16b Visible Finale Button

Stand: 2026-06-18

## Ziel

Der Backend-Check fuer die Auswertung funktionierte bereits (`finaleEligibility.canStart=true`), aber der Dashboard-Button war im sichtbaren Event-Detail nicht sichtbar.

## Änderung

- `htdocs/dashboard/modules/stream_events.js` Dashboard-Version 0.5.54 / `STEP_EVS52_16B_VISIBLE_FINALE_BUTTON`.
- Helper `finaleActionButtonForEvent(event)` ergänzt.
- Button `🏆 Auswertung starten` direkt im sichtbaren Event-Verwalten-Buttonblock eingebaut.
- Button zusätzlich im Tab `Aktuelles Event` sichtbar, wenn die Eligibility für das ausgewählte Event true ist.
- CSS-Klasse `.evs-btn-finale` ergänzt.

## Nicht geändert

- Backend-Finale-Logik.
- Punkte / Ranking.
- Chat / Sound / Satz.
- Datenbank.

## Test

1. Beendetes Event mit Ranking auswählen.
2. Dashboard hart neu laden.
3. Button `Auswertung starten` muss im Event-Detail erscheinen.
4. Klick startet Finale über bestehende Route.
