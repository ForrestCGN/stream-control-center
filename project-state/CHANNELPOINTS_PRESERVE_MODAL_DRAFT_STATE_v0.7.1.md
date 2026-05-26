# Kanalpunkte UI v0.7.1 — Preserve Modal Draft State

## Inhalt

Dashboard-Fix für den Kanalpunkte-Modal-Editor.

## Änderung

Wenn im offenen Modal ein Medium gewählt oder ein UI-Refresh ausgelöst wird, bleiben die bereits eingegebenen Entwurfsdaten erhalten.

## Tests

```bat
node --check htdocs\dashboard\modules\channelpoints.js
```

Manuell:

1. Neuer Reward öffnen.
2. Reward-Key und Titel eintragen.
3. Sound abspielen wählen.
4. Medium auswählen.
5. Prüfen, dass Reward-Key/Titel erhalten bleiben.
