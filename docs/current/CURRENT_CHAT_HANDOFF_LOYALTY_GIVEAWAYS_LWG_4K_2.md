# CURRENT CHAT HANDOFF – Loyalty Giveaways LWG-4K.2

Stand: 2026-06-09

## Status

```text
STEP LWG-4K.2 – Static Chat Routes Order Fix live bestätigt
```

## Problem

```text
/api/loyalty/giveaways/commands
/api/loyalty/giveaways/texts
```

wurden vor dem Fix von `/api/loyalty/giveaways/:giveawayUid` abgefangen und als Giveaway-UID interpretiert.

## Lösung

Statische Routen werden vor der dynamischen `:giveawayUid`-Route registriert.

## Live bestätigt

```text
commands ok=true, active=false, count=2
texts ok=true, module=loyalty_giveaways, count=9, variantCount=27
```

## Festlegung

```text
!ticket eingetragen, inaktiv
!wheel eingetragen, inaktiv
!rad Alias von !wheel, inaktiv
!join bleibt unberührt
Streamer.bot außen vor
```
