# Loyalty Giveaways Modul

Stand: 2026-06-08  
STEP: LWG-4I.1

## Fix

`loyalty_giveaway_winners` wird jetzt auch bei bestehenden Installationen per Safety-Net angelegt.

Safety-Net:

```text
CREATE TABLE IF NOT EXISTS loyalty_giveaway_winners
CREATE INDEX IF NOT EXISTS ...
```

Keine bestehenden Daten werden veraendert.
