# CURRENT CHAT HANDOFF – Loyalty Giveaways LWG-4H.1

Stand: 2026-06-08

## Fix

```text
STEP LWG-4H.1 – Entries Table Safety Fix
```

## Problem

```text
no such table: loyalty_giveaway_entries
```

## Ursache

Schema-Version war bereits 1, daher lief die LWG-4H-Migration nicht erneut.

## Loesung

`backend/modules/loyalty_giveaways.js` legt `loyalty_giveaway_entries` jetzt zusaetzlich per Safety-Net immer mit `CREATE TABLE IF NOT EXISTS` an.
