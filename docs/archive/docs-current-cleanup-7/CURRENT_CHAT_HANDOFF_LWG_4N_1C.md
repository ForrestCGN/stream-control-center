# Current Chat Handoff – LWG-4N.1c

## Stand

LWG-4N.1b ist bestätigt aktiv und zeigt unvollständige Wheel-Giveaways korrekt an.

LWG-4N.1c ist ein reiner Dashboard-UX-Step.

## Änderung

Datei: `htdocs/dashboard/modules/loyalty_games.js`

- Sichtbare Status-Badges werden eingedeutscht.
- `draft` erscheint als `Entwurf`.
- `finished` erscheint als `Beendet`.
- `active` erscheint als `Aktiv`.
- `open` erscheint als `Offen`.
- `Unvollständig` bekommt einen deutlich orangefarbenen Warnstil.
- Die Meldung für fehlende Glücksrad-Felder wurde freundlicher formuliert.

## Wichtig

Die API-Statuswerte bleiben technisch unverändert. Es wird nur die Dashboard-Anzeige übersetzt/verbessert.

## Nächster Schritt

Weiter sinnvoll:

- LWG-4N.1d – Giveaway-Titel-Duplikat-Guard
- danach LWG-4N.2 – Preset-Editor als großes Dashboard-Modal vorbereiten
