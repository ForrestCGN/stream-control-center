# CURRENT CHAT HANDOFF – Loyalty Giveaways LWG-4K.2

Stand: 2026-06-08

## Fix

```text
STEP LWG-4K.2 – Static Chat Routes Order Fix
```

## Problem

```text
/api/loyalty/giveaways/commands
/api/loyalty/giveaways/texts
```

wurden von `/api/loyalty/giveaways/:giveawayUid` abgefangen.

## Lösung

Statische Chat-Setup-Routen werden jetzt vor der dynamischen Giveaway-UID-Route registriert.
