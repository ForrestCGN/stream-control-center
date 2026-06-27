# LWG-COPY-BOUND-WHEEL-1

Datum: 2026-06-19T07:48:19

## Ziel

Der vorhandene Kopieren-Button im Giveaway-Dashboard bleibt erhalten, erstellt aber nach dem Backend-Copy zusätzlich ein eigenes giveaway-bound Glücksrad für die Kopie.

Damit gilt:

- Original-Giveaway und Kopie teilen sich kein Bound-Wheel.
- Die Kopie bekommt eigene Bound-Wheel-Felder.
- Es wird kein globales Preset als gemeinsame Laufzeitquelle verwendet.
- Die Felder werden aus dem Bound-Wheel des Original-Giveaways in das Bound-Wheel der Kopie kopiert.

## Geänderte Datei

- `htdocs/dashboard/modules/loyalty_giveaways.js`

## Nicht geändert

- Backend
- SQLite-Struktur
- Raffle
- Punktebuchung
- Commands
- globale Wheel-Presets

## Test

1. Dashboard öffnen.
2. Bestehendes Wheel-Giveaway öffnen.
3. `Kopieren` klicken.
4. Die Meldung sollte lauten:
   `Giveaway wurde kopiert. Eigenes Glücksrad wurde mit X Feld(ern) für die Kopie angelegt.`
5. Kopie öffnen und prüfen:
   - Status: Draft
   - Wheel/Giveaway-Modus aktiv
   - Bound-Wheel vorhanden
   - Bound-Wheel-Felder vorhanden
6. Optional per Script `tools/lwg_copy_giveaway_wheel_check.ps1` gegenprüfen.

## StepDone

```powershell
.\stepdone.cmd "LWG-COPY-BOUND-WHEEL-1 Giveaway-Kopie erstellt eigenes Bound-Wheel"
```
