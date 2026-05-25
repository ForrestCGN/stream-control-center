# NEXT_STEPS nach STEP456_SOUND_SYSTEM_BUS_FIRST_TEST_SWITCH

1. ZIP entpacken.
2. `stepdone.cmd` ausfuehren.
3. `node --check backend\modules\sound_system.js` ausfuehren.
4. Node neu starten.
5. Minimierten Status pruefen.
6. Einen SO/Video-Test ausloesen und nur `emitted`, `errors`, `lastAction`, `lastError` pruefen.

Kein weiterer Umbau noetig, wenn `errors = 0` bleibt und Video/SO wie bisher laeuft.
