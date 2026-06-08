# Loyalty Giveaways Modul

Stand: 2026-06-08  
STEP: LWG-4J.1

## Fix

`loyalty_giveaway_wheel_permissions` wird jetzt auch bei bestehenden Installationen per Safety-Net angelegt.

Safety-Net:

```text
CREATE TABLE IF NOT EXISTS loyalty_giveaway_wheel_permissions
CREATE INDEX IF NOT EXISTS ...
```

Keine bestehenden Daten werden verändert.
