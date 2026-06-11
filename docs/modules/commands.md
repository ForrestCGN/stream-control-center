# Commands – STEP228 / LWG-6.9

Der zentrale Command `!gamble` wird nicht durch neue Logik ersetzt. STEP228 erlaubt dem Dashboard lediglich, geschützte Command-Felder kontrolliert zu setzen:

- `enabled`
- `cooldownUserMs`
- `cooldownGlobalMs`
- `sendResultToChat`
- `activationState`

Alle Änderungen laufen über `POST /api/loyalty/games/gamble/dashboard-config` und werden auditiert.
