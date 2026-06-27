# Current Chat Handoff – LWG_BOUND_WHEEL_FIELD_COUNT_1

Datum: 2026-06-19
Projekt: stream-control-center / Loyalty-Giveaways / Giveaway-bound CGN-Glücksrad

## Kurzstatus

Step `LWG_BOUND_WHEEL_FIELD_COUNT_1` wurde als ZIP-Dateistand vorbereitet.

Ziel: Giveaway-bound Wheels sollen heute im Stream korrekt laufen.

## Umgesetzte Regel

```text
2+ verfügbare Gewinne  → normaler Glücksrad-Spin mit exakt diesen verfügbaren Feldern
1 verfügbarer Gewinn   → Direktvergabe im Backend, kein normaler Wheel-Spin
0 verfügbare Gewinne   → Claim/Spin blockieren
```

## Geänderte Dateien

```text
backend/modules/loyalty_giveaways.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_LWG_BOUND_WHEEL_FIELD_COUNT_1.md
docs/modules/loyalty_giveaways_CURRENT.md
project-state/CURRENT_STATUS_LWG_BOUND_WHEEL_FIELD_COUNT_1.md
```

## Unverändert

```text
config/loyalty_games.json
htdocs/overlays/loyalty/wheel_overlay.html
```

## Wichtig vor Deploy

Vor dem Einspielen im Live-System eine Sicherheitskopie der aktuell laufenden Dateien erstellen.

## StepDone nach Deploy

```powershell
.\stepdone.cmd "LWG_BOUND_WHEEL_FIELD_COUNT_1 - Bound-Wheel Feldanzahl und letzter Gewinn"
```

## Nach Deploy testen

```powershell
node -c .\backend\modules\loyalty_games\wheel.js
node -c .\backend\modules\loyalty_games.js
node -c .\backend\modules\loyalty_giveaways.js
```

Dann Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/status" |
  Select-Object ok,module,moduleVersion,moduleBuild,enabled,lastError

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status" |
  Select-Object ok,module,moduleVersion,moduleBuild,enabled,lastError
```

## Späteres Follow-up

Diese Lösung ist heute bewusst fest eingebaut. Später muss sie im Dashboard konfigurierbar werden:

- 1 verbleibender Gewinn: Direktvergabe / Letzter-Gewinn-Overlay / optional trotzdem Spin.
- 0 verfügbare Gewinne: Dashboard-Hinweis und saubere Sperre.
- Exakte Feldanzahl vs. Mindestfeldanzahl pro Wheel-Typ sauber trennen.
