# Loyalty Giveaways – Runtime Bound-Wheel Spin

Ab LWG-4N.7 wird bei Wheel-Giveaways für den Spin die Bound-Wheel-Feldliste verwendet.

Wichtig:
- `sourcePresetUid` bleibt Herkunft/Referenz, ist aber nicht mehr die Runtime-Feldbasis.
- `boundWheelUid` / `wheelSnapshotUid` definieren das konkrete Giveaway-Glücksrad.
- Felder kommen aus `loyalty_giveaway_bound_wheel_fields`.
- Globale Presets werden durch Giveaway-Spins nicht verändert.
