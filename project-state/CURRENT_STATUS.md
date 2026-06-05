# CURRENT_STATUS - VIP30 STEP8

VIP30 steht auf Version `0.8.0` / Build `step8-live-action-plan-safety-gates`.

Bestätigter Stand aus STEP7/STEP7.2:

- echter Twitch-Reward ist mit lokalem `vip30` Reward verknüpft
- Testkosten: 1 Kanalpunkt
- EventSub-Live-Test kam bei VIP30 an
- Decision: `eligible`
- DB-Log wurde geschrieben
- `ensure` funktioniert wieder

STEP8 ergänzt:

- Route `GET /api/vip30/live/check`
- Route `POST /api/vip30/redeem/live-plan`
- DB-/Dashboard-Settings für Live-Safety-Gates
- EventBus-Event `vip30.live / plan`

Safety: Es werden weiterhin keine echten Twitch-/Slot-Aktionen ausgeführt.
