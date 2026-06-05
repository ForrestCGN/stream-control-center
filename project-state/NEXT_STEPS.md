# NEXT_STEPS - VIP30

1. STEP8.3 einspielen und `node -c backend\modules\vip30.js` prüfen.
2. Node neu starten.
3. `/api/vip30/live/stage-a/check` prüfen; erwartet `stage_a_ready`.
4. Test-Redemption auslösen.
5. `/api/vip30/slots` und letzte Logs prüfen.
6. Danach STEP8.4 planen: Fulfill/Cancel separat aktivieren.


## VIP30 STEP8.3.1
- Version 0.8.3.1 / build step8.3.1-stage-a-preflight-refresh-diagnostics.
- Stage-A Live-Ausfuehrung aktualisiert vor dem VIP-Grant Capability und Config frisch.
- Block-Logs enthalten nun konkrete Stage-A-Blocker.
- Fulfill/Cancel und Alert bleiben weiterhin deaktiviert.
