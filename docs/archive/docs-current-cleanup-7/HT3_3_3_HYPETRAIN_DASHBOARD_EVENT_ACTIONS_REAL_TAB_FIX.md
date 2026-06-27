# HT3.3.3 HypeTrain Dashboard Event-Actions Real-Tab Fix

Fix für HT3.3.2: Der Event-Actions-Tab darf nicht unter der Übersicht hängen.

Änderungen:
- `hypetrain_event_actions.js` setzt den Event-Actions-Tab aktiv und hält ihn aktiv, auch wenn das Grundmodul erneut rendert.
- `hypetrain_event_actions.css` blendet bei aktivem Event-Actions-Tab alle normalen Übersichtsinhalte per Tab-Klasse aus.
- `index.html` Cache-Version auf `STEP_HT3_3_3`.

Keine Backend- oder DB-Änderungen.
