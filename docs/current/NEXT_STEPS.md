# Next Steps – LWG Bound-Wheel Field Count 1

Stand: 2026-06-19

## Nächster Schritt nach ZIP-Einspielen

1. Sicherheitskopie der aktuell laufenden Dateien erstellen.
2. ZIP in `D:\Git\stream-control-center` bzw. Live-Struktur einspielen.
3. Deploy/Einspielen nach eurer üblichen Arbeitsweise ausführen.
4. Danach StepDone ausführen.
5. Erst danach Runtime-Tests starten.

## StepDone

```powershell
.\stepdone.cmd "LWG_BOUND_WHEEL_FIELD_COUNT_1 - Bound-Wheel Feldanzahl und letzter Gewinn"
```

## Pflicht-Tests

### Syntax

```powershell
node -c .\backend\modules\loyalty_games\wheel.js
node -c .\backend\modules\loyalty_games.js
node -c .\backend\modules\loyalty_giveaways.js
```

### Status

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/status" |
  Select-Object ok,module,moduleVersion,moduleBuild,enabled,lastError

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status" |
  Select-Object ok,module,moduleVersion,moduleBuild,enabled,lastError
```

Erwartet:

```text
loyalty_games     moduleVersion=0.2.8  moduleBuild=LWG_BOUND_WHEEL_FIELD_COUNT_1
loyalty_giveaways moduleVersion=0.1.13 moduleBuild=LWG_BOUND_WHEEL_FIELD_COUNT_1
```

### Fachliche Tests

- 2+ verfügbare Bound-Wheel-Felder:
  - normaler Spin startet.
  - `fieldsCount` entspricht `visualFieldsCount`.
  - Overlay zeigt exakt verfügbare Felder.
- 1 verfügbares Bound-Wheel-Feld:
  - kein normaler Wheel-Spin.
  - Direktvergabe im Backend.
  - Winner wird `wheel_completed`.
  - Permission wird `used`.
- 0 verfügbare Bound-Wheel-Felder:
  - Claim/Spin blockiert mit `bound_wheel_no_usable_fields`.

## Danach / spätere Planung

Nicht heute zwingend umsetzen, aber dokumentiert offen lassen:

- Dashboard-Konfiguration für Verhalten bei 1 verbleibendem Gewinn.
- Optionales Letzter-Gewinn-Overlay.
- Dashboard-Anzeige für erschöpfte Bound-Wheels.
- Saubere UI-Trennung zwischen Giveaway-bound Wheel und Standalone-/Preset-Wheel-Konfiguration.
