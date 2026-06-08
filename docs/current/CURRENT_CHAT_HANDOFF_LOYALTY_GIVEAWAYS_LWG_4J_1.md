# CURRENT CHAT HANDOFF – Loyalty Giveaways LWG-4J.1

Stand: 2026-06-08

## Fix

```text
STEP LWG-4J.1 – Wheel Permissions Table Safety Fix
```

## Problem

```text
no such table: loyalty_giveaway_wheel_permissions
```

## Lösung

`backend/modules/loyalty_giveaways.js` legt `loyalty_giveaway_wheel_permissions` jetzt zusätzlich per Safety-Net immer mit `CREATE TABLE IF NOT EXISTS` an.
