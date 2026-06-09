# TODO – Loyalty Giveaways / Glücksrad

## Aktuell offen

### LWG-4M.5 – Live-Test
- [ ] Code-ZIP einspielen.
- [ ] `node -c .\backend\modules\loyalty_giveaways.js` ausführen.
- [ ] StepDone ausführen.
- [ ] Wheel-Giveaway erstellen.
- [ ] Prüfen: Bound-Wheel ist im Draft `draft`.
- [ ] Giveaway öffnen.
- [ ] Prüfen: Bound-Wheel wird `active` und `locked=true`.
- [ ] Ticket eintragen.
- [ ] Close ausführen.
- [ ] Draw ausführen.
- [ ] Prüfen: Permission enthält `boundWheelUid`, `wheelSnapshotUid`, `sourcePresetUid`, `wheelScope`.
- [ ] Claim/Spin ausführen.
- [ ] Prüfen: Spin läuft mit `source=giveaway_bound_wheel` und `sourceRefUid=<boundWheelUid>`.
- [ ] Prüfen: Globaler Wheel-Spin bleibt normal nutzbar.

### LWG-4M.6 – Dashboard Giveaway-Wheel UI
- [ ] Giveaway-Formular bekommt Dropdown `Glücksrad-Basis`.
- [ ] Dropdown-Einträge:
  - `Neues Rad für dieses Giveaway erstellen`
  - `Vorlage kopieren: <Preset-Name>`
- [ ] Bound-Wheel-Name wird aus Giveaway-Name gebildet.
- [ ] Anzeige `Gebundenes Rad`.
- [ ] Button/Aktion `Rad bearbeiten` im Giveaway-Kontext.

### LWG-4M.7 – echter Field-Snapshot / Bound-Wheel-Fields
- [ ] Prüfen, ob Bound-Wheel-Felder als eigene Snapshot-Tabelle oder als `GIVEAWAY_LINKED` Preset abgebildet werden sollen.
- [ ] Danach globale Preset-Änderungen vollständig von laufenden Giveaways entkoppeln.

### Später
- [ ] Kostenpflichtige Tickets erst nach sicherer Punktebuchung aktivieren.
- [ ] Kanalpunkte-Wheel ohne Giveaway als separaten globalen Wheel-Use-Case anbinden.
- [ ] Dashboard für aktive Giveaways / Status / Winner / Wheel-Permission.
