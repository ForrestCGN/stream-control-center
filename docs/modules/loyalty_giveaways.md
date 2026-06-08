# Loyalty Giveaways Modul

Stand: 2026-06-08  
STEP: LWG-4H.1

## Fix

`loyalty_giveaway_entries` wird jetzt auch bei bestehenden Installationen per Safety-Net angelegt.

Grund:

```text
Bestehende DB hatte bereits schemaVersion=1.
Die eigentliche Migration wurde deshalb nicht erneut ausgefuehrt.
```

Safety-Net:

```text
CREATE TABLE IF NOT EXISTS loyalty_giveaway_entries
CREATE INDEX IF NOT EXISTS ...
```

Keine bestehenden Daten werden veraendert.
