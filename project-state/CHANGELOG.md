# Changelog – stream-control-center

## 2026-06-08 – STEP LWG-4J.1 Wheel Permissions Table Safety Fix

### Fix

- `loyalty_giveaway_wheel_permissions` wird bei Modulstart per Safety-Net angelegt.
- Behebt `no such table: loyalty_giveaway_wheel_permissions` bei bestehender DB-Schema-Version.
