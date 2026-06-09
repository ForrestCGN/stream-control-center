# CURRENT_STATUS – Loyalty Giveaways / Glücksrad

Stand: LWG-4M.5 vorbereitet
Aktualisiert: 2026-06-09 08:31:22 UTC

## Aktueller technischer Stand

### Letzter Backend-Code-Step
- `backend/modules/loyalty_giveaways.js`
- `MODULE_BUILD = STEP_LWG_4M_5`

### LWG-4M.5 – Bound Wheel aktivieren und beim Claim/Spin verwenden

Umgesetzt:
- Bound-Wheel-Status wird beim Öffnen eines Wheel-Giveaways von `draft` auf `active` gesetzt.
- Bound-Wheel wird beim Aktivieren gelockt (`locked=1`).
- Wheel-Draw prüft bei Wheel-Giveaways ein aktives Bound-Wheel.
- Wheel-Permission speichert jetzt eindeutig:
  - `wheelPresetUid`
  - `wheelSnapshotUid`
  - `boundWheelUid`
  - `sourcePresetUid`
  - `wheelScope=giveaway`
  - `wheelContext=giveaway_bound_wheel`
- Claim/Spin prüft die Permission gegen das gebundene Giveaway-Wheel.
- Claim/Spin startet den Spin mit `source=giveaway_bound_wheel` und `sourceRefUid=<boundWheelUid>`.
- Globale Wheel-Presets bleiben weiterhin für normale Nutzung verfügbar.
- Keine Punktebuchung eingebaut.
- Keine Command-Aktivierung eingebaut.

### Technische Hinweise

Das aktuelle Bound-Wheel-Modell nutzt weiterhin `sourcePresetUid` als Feldbasis für den Spin, weil in LWG-4M.4 noch keine eigene Bound-Wheel-Field-Tabelle bzw. kein eigener Field-Snapshot implementiert wurde. Der Spin wird aber eindeutig über den Giveaway-/Bound-Wheel-Kontext protokolliert.

## Noch nicht bestätigt

Live-Test steht noch aus.

## Pflicht-Test vor Live-Test

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

## StepDone vor Live-Test

```powershell
.\stepdone.cmd "STEP LWG-4M.5 Bound Wheel aktivieren und beim Claim/Spin verwenden"
```
