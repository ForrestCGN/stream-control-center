# Changelog – stream-control-center

## 2026-06-08 – STEP LWG-4H.1 Entries Table Safety Fix

### Fix

- `loyalty_giveaway_entries` wird bei Modulstart per Safety-Net angelegt.
- Behebt `no such table: loyalty_giveaway_entries` bei bestehender DB-Schema-Version.
