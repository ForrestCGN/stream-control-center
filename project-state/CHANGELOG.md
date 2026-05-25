# CHANGELOG – STEP435

- Bumped `vip_sound_overlay.js` to version `1.8.18`.
- Changed feature marker to `vip_sound_guard_real_flow_diagnostics`.
- Attached VIP bus-mode Guard/Fallback diagnostics to the real VIP command path.
- Added real-flow diagnostic counters to sound-command status:
  - `realFlowChecks`
  - `realFlowLegacyFallbacks`
  - `lastRealFlowGuard`
- Added Guard/Fallback metadata to accepted VIP command responses.
- Added Guard/Fallback metadata to the legacy Sound-System payload meta block for traceability.
- Kept productive VIP flow unchanged as `legacy_sound_system_api`.
- Kept `bus_enabled` prepared only; productive Bus activation remains blocked.
