# NEXT_STEPS – STEP202.3 Alerts v2

1. Open and inspect real files:
   - backend/modules/tipeee.js
   - backend/modules/twitch.js
   - backend/modules/alert_system.js
   - htdocs/dashboard/modules/alerts.js

2. Implement Tipeee Twitch-origin filter before alert enqueue:
   - primary: raw.event.origin == "twitch"
   - fallback: raw.event.ref starts with "TWITCH_"
   - fallback: raw.event.type is cheer/raid/follow/sub/resub/subscription/gift/gifted_subscription
   - blocked events must not enter alert_events or queue
   - optional: save as ignored provider_event

3. Implement global alert enable/disable:
   - DB setting preferred
   - block before queue
   - dashboard control

4. Audit Twitch subscription mapping:
   - sub
   - resub
   - giftSub
   - communityGift/Sub-Bombe with amount

5. Add/adjust alert history route:
   - preferred: GET /api/alerts/events?limit=100
   - dashboard should not depend only on status.history slice(0,10)

6. Build PowerShell test script in tools.
7. Document result and run stepdone.
