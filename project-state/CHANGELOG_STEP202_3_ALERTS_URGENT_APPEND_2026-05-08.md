# CHANGELOG Append – STEP202.3 Alert Pflichtliste v2

## 2026-05-08

- Confirmed Tipeee provider duplicates Twitch events in Live DB.
- Confirmed Twitch Bits/Raid can appear again as Tipeee donation within <1s.
- Added urgent next-step requirement:
  - filter Tipeee Twitch-origin events
  - add global Alert disable before queue/enqueue
  - distinguish sub/resub/giftSub/communityGift
  - detect Sub-Bomb/CommunityGift count
  - fix Alert-History 10-entry limit
- Added concrete filter decision:
  - primary filter: `raw.event.origin === "twitch"`
  - fallback: `ref` starts with `TWITCH_`
  - fallback: Twitch event types such as cheer/raid/follow/sub/resub/subscription/gift
