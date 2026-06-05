# NEXT_STEPS – VIP30

1. STEP8.5 einspielen und `node -c backend/modules/vip30.js` ausführen.
2. Node neu starten.
3. Capability prüfen.
4. `/api/vip30/cleanup/check` testen.
5. `/api/vip30/cleanup/run` erst ohne Confirm als Dry-Run testen.
6. Bei Bedarf `/api/vip30/cleanup/run?confirm=YES` nutzen.
7. Danach STEP8.6 planen: EventSub `channel.vip.remove` für externen VIP-Entzug.
8. Danach Alert-System anbinden.
