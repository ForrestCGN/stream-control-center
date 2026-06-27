# CURRENT CHAT HANDOFF – Loyalty Giveaways LWG-4I.1

Stand: 2026-06-08

## Fix

```text
STEP LWG-4I.1 – Winners Table Safety Fix
```

## Problem

```text
no such table: loyalty_giveaway_winners
```

## Loesung

`backend/modules/loyalty_giveaways.js` legt `loyalty_giveaway_winners` jetzt zusaetzlich per Safety-Net immer mit `CREATE TABLE IF NOT EXISTS` an.
