# TODO – Loyalty Giveaways / Glücksrad

## Aktuell offen

### LWG-4M.5 – Bound Wheel Claim/Spin final anbinden
- [ ] Festlegen, wann `loyalty_giveaway_bound_wheels.status` von `draft` auf nutzbar/aktiv wechselt.
- [ ] Draw bei Wheel-Giveaways muss Bound-Wheel referenzieren.
- [ ] Wheel-Permission muss Bound-Wheel eindeutig enthalten.
- [ ] Claim per `!wheel` / `!rad` muss das Bound-Wheel nutzen, nicht direkt das globale Preset.
- [ ] Globaler Wheel-Spin darf Giveaway-bound Wheels nicht direkt starten.
- [ ] Test: Globales Preset bleibt normal nutzbar.
- [ ] Test: Bound Wheel ist nur über Giveaway-Permission nutzbar.

### LWG-4M.6 – Dashboard Giveaway-Wheel UI
- [ ] Giveaway-Formular bekommt Dropdown `Glücksrad-Basis`.
- [ ] Dropdown-Einträge:
  - `Neues Rad für dieses Giveaway erstellen`
  - `Vorlage kopieren: <Preset-Name>`
- [ ] Bound-Wheel-Name wird aus Giveaway-Name gebildet.
- [ ] Anzeige `Gebundenes Rad`.
- [ ] Button/Aktion `Rad bearbeiten` im Giveaway-Kontext.

### LWG-4M.7 – Preset-/Wheel-Editor Modal
- [ ] Ein Editor, zwei Kontexte:
  - global
  - giveaway
- [ ] Global-Modus: normale Presets erstellen/bearbeiten.
- [ ] Giveaway-Modus: gebundenes Wheel bearbeiten.
- [ ] Giveaway-bound Wheels nicht in globaler Preset-Nutzung anbieten.
- [ ] Name im Giveaway-Modus aus Giveaway ableiten oder eingeschränkt editierbar machen.

### LWG-4M.8 – Chat-/Mod-Commands für Giveaway-Steuerung
- [ ] Mod-Command für Giveaway schließen planen.
- [ ] Mod-Command für Draw planen.
- [ ] Rechteprüfung über zentrales `commands`-System.
- [ ] Chattexte DB-/helper_texts-basiert und variantenfähig.

### Später
- [ ] Kostenpflichtige Tickets erst nach sicherer Punktebuchung aktivieren.
- [ ] Kanalpunkte-Wheel ohne Giveaway als separaten globalen Wheel-Use-Case anbinden.
- [ ] Dashboard für aktive Giveaways / Status / Winner / Wheel-Permission.
- [ ] Audit-/EventBus-Doku für Giveaway-Events erweitern.
