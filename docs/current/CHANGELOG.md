# Changelog – Loyalty-Giveaways / CGN-Glücksrad

## 2026-06-19 – LWG_BOUND_WHEEL_FIELD_COUNT_1

### Added

- Feste Runtime-Regel für Giveaway-bound Wheels vorbereitet:
  - 2+ verfügbare Gewinne → normaler Spin mit exakt diesen Feldern.
  - 1 verfügbarer Gewinn → Direktvergabe im Backend ohne normalen Wheel-Spin.
  - 0 verfügbare Gewinne → Claim/Spin blockieren.
- Doku-/TODO-Hinweis ergänzt, dass diese feste Regel später dashboardfähig konfigurierbar gemacht werden muss.
- Backup-Hinweis vor Live-Deploy ergänzt.

### Changed

- `backend/modules/loyalty_games/wheel.js`:
  - Giveaway-bound Wheel nutzt keine visuelle Auffüllung auf 12 Slots mehr.
  - Metadata enthält `visualMinVisibleSlots` und `giveawayBoundWheelExactFields`.
- `backend/modules/loyalty_giveaways.js`:
  - Bound-Wheel-Kontext setzt `minVisibleSlots` auf die echte verfügbare Feldanzahl.
  - Claim-Flow behandelt 0/1/2+ verfügbare Felder getrennt.
- `backend/modules/loyalty_games.js`:
  - Modulversion auf `0.2.8`, Build `LWG_BOUND_WHEEL_FIELD_COUNT_1`.
- `backend/modules/loyalty_giveaways.js`:
  - Modulversion auf `0.1.13`, Build `LWG_BOUND_WHEEL_FIELD_COUNT_1`.

### Tested before handoff

```text
node -c backend/modules/loyalty_games/wheel.js
node -c backend/modules/loyalty_games.js
node -c backend/modules/loyalty_giveaways.js
```

Alle drei Syntax-Checks waren erfolgreich.

### Follow-up

- Verhalten bei 1 verbleibendem Gewinn später per Dashboard-Config steuerbar machen.
- Optionales Letzter-Gewinn-Overlay später planen.
- Erschöpfte Bound-Wheels streamerfreundlich im Dashboard anzeigen.
