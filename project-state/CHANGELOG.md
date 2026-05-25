# CHANGELOG

## STEP406 – VIP EventBus Status Diagnostics

- Ergänzt `buildVipEventBusStatus()` für klare Statusausgabe der VIP EventBus-Anbindung.
- Ergänzt `/eventbus/status` für beide VIP-Prefixe.
- Ergänzt `/eventbus/reset` für reine Diagnosezähler.
- Ergänzt `eventbus_status_events` im Integration-Check.
- Bestehender VIP-/Mod-Sound-Flow bleibt unverändert.
- Keine Overlay-, Queue-, Daily-Usage- oder Sound-System-Änderung.

## STEP405 – VIP EventBus Status Events

- VIP-System sendet zusätzliche Status-Events auf `vip.sound`.
- EventBus-Fehler blockieren VIP-Sounds nicht.
