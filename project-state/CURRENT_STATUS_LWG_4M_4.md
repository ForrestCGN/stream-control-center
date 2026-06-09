# CURRENT_STATUS – LWG-4M.4

LWG-4M.4 Backend-Step vorbereitet.

Aktueller Code-Build:
- `STEP_LWG_4M_4`

Neu:
- `loyalty_giveaway_bound_wheels`
- Bound-Wheel-Autocreate bei Wheel-Giveaways
- GET/PUT bound wheel routes

Nächste Tests:
- Status auf STEP_LWG_4M_4 prüfen
- Wheel-Giveaway mit globalem Preset erstellen
- Prüfen, dass `wheelSnapshotUid` gesetzt ist
- Prüfen, dass `boundWheel.name` dem Giveaway-Namen folgt
- GET `/wheel/bound` prüfen
