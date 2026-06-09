# CHANGELOG – Loyalty Giveaways / Glücksrad

## LWG-4M.5 – Bound Wheel aktivieren und beim Claim/Spin verwenden
Datum: 2026-06-09 08:31:22 UTC

### Added
- `BOUND_WHEEL_STATUS` für Bound-Wheel-Lifecycle.
- Guard `getUsableBoundWheelForGiveaway()`.
- Aktivierung `activateBoundWheelForGiveawayRow()` beim Öffnen eines Wheel-Giveaways.
- Draw-Guard auf aktives Bound-Wheel.
- Permission-Metadata mit Bound-Wheel-Kontext.
- Claim-Guard gegen Permission-/Bound-Wheel-Mismatch.
- Spin-Start mit `source=giveaway_bound_wheel` und `sourceRefUid=<boundWheelUid>`.

### Changed
- `MODULE_BUILD` auf `STEP_LWG_4M_5`.
- Route-Liste ergänzt Bound-Wheel-Routen.
- `winner_drawn` Event-Payload korrigiert, damit wieder ein Objekt statt eines falschen String-Payloads published wird.

### Not changed
- Keine Punktebuchung.
- Keine Command-Aktivierung.
- Keine Dashboard-UI.
- Kein Streamer.bot.

### Notes
- Live-Test steht noch aus.
- Der aktuelle Spin nutzt technisch noch die Field-Basis des `sourcePresetUid`, wird aber eindeutig als Giveaway-bound Spin markiert. Ein echter Field-Snapshot ist als Folgeschritt LWG-4M.7 dokumentiert.

## LWG-4M.4 – Giveaway-bound Wheel Foundation

### Added
- Backend-Grundlage für giveaway-gebundene Wheels.
- Neue Bound-Wheel-Struktur/Tabelle.
- Automatische Erstellung eines Bound-Wheels bei Wheel-Giveaway.
- `GET /api/loyalty/giveaways/:giveawayUid/wheel/bound`
- `PUT /api/loyalty/giveaways/:giveawayUid/wheel/bound`
