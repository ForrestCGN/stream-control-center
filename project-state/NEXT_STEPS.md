# NEXT_STEPS after STEP426

Recommended next step:

## STEP427 - VIP to Sound Bus Command Test Flow

Use the new Sound EventBus command test layer from VIP in shadow/test mode.

Rules:

- VIP productive flow stays unchanged.
- No removal of legacy VIP/Sound routes.
- Add config/runtime mode such as `shadow`, `test`, `enabled` before any production switch.
- Keep fallback to old VIP -> `/api/sound/play` route.
