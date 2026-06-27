# Current Chat Handoff – LWG-4N.1b

## Stand

LWG-4N.1b ersetzt den vorher erzeugten, aber nicht eingespielten LWG-4N.1-Guard.

Die neue UX-Regel lautet:

- Wheel-Giveaways dürfen unvollständig als Entwurf gespeichert werden.
- Öffnen/Aktivieren ist erst erlaubt, wenn alle Pflichtdaten vollständig sind.
- Der Bereit-Status wird dynamisch aus dem aktuellen Giveaway-Zustand berechnet.

## Technische Änderungen

### Backend

Datei: `backend/modules/loyalty_giveaways.js`

- Build: `STEP_LWG_4N_1B`
- `rowToGiveaway()` liefert jetzt:
  - `setupComplete`
  - `setupState`
  - `canOpen`
  - `setupIssues`
- `setGiveawayStatus(..., open)` blockiert mit `giveaway_open_requires_complete_setup`, wenn das Setup unvollständig ist.

### Dashboard

Datei: `htdocs/dashboard/modules/loyalty_games.js`

- Draft-Giveaways zeigen `Bereit` oder `Unvollständig`.
- Detailansicht zeigt fehlende Pflichtdaten.
- Open-Button ist sichtbar, aber deaktiviert, solange das Giveaway nicht bereit ist.
- Wheel-Giveaway kann ohne Preset gespeichert werden, bleibt dann aber unvollständig.

## Bewusste Entscheidung

Das alte ZIP `LWG-4N.1_dashboard_wheel_giveaway_guard.zip` soll nicht eingespielt werden, weil es Speichern blockiert hätte. Dieser Step ersetzt es.

## Nächster Schritt

LWG-4N.2 sollte den gemeinsamen Preset-Editor als großes Dashboard-Modal vorbereiten, damit Presets im Presets-Tab und später im Giveaway-Kontext nutzbar sind.
