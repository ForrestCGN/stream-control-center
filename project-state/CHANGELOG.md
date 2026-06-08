# Changelog – stream-control-center

## 2026-06-08 – STEP LWG-4I.1 Winners Table Safety Fix

### Fix

- `loyalty_giveaway_winners` wird bei Modulstart per Safety-Net angelegt.
- Behebt `no such table: loyalty_giveaway_winners` bei bestehender DB-Schema-Version.
