# Changelog – stream-control-center

## 2026-06-08 – STEP LWG-4D Giveaway Backend Grundsystem v0.1.0

### Neu

- Neues Backend-Modul `backend/modules/loyalty_giveaways.js`.
- Tabellen:
  - `loyalty_giveaways`
  - `loyalty_giveaway_rounds`
  - `loyalty_giveaway_prizes`
  - `loyalty_giveaway_events`
- API-Grundrouten fuer Create/List/Get/Update/Copy/Open/Close/Finish/Cancel/Delete.
- Event-/Audit-Grundlage.
- Diagnostics-Registry-Eintrag fuer Loyalty Giveaways.

### Nicht enthalten

- Keine Tickets.
- Keine Gewinnerziehung.
- Kein Rad-Claim.
- Kein Giveaway-Dashboard.
- Keine Punktebuchung.
- Keine Reward-Ausfuehrung.
