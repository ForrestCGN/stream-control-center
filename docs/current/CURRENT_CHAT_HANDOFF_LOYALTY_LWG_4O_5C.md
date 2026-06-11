# Current Chat Handoff – Loyalty LWG-4O.5c

## Stand

LWG-4O.5c behebt den JavaScript-Fehler im Giveaways-Tab:

```text
Uncaught ReferenceError: statusLabel is not defined
```

Der Fehler entstand im Dashboard-Modul `htdocs/dashboard/modules/loyalty_games.js` beim Rendern der Giveaway-Liste.

## Geänderte Datei

- `htdocs/dashboard/modules/loyalty_games.js`

## Wichtig

- Kein Backend geändert.
- Keine DB geändert.
- LWG-4O.5b Direct Navigation bleibt erhalten.
- Danach weiter mit der fachlichen Wheel-/Classic-Giveaway-Flow-Klärung.

## StepDone

```powershell
.\stepdone.cmd "STEP LWG-4O.5c Giveaways Tab statusLabel Fix"
```
