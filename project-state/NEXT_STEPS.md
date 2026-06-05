# NEXT_STEPS

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. `node -c backend\modules\vip30.js` ausführen.
3. `stepdone.cmd` ausführen.
4. Node neu starten.
5. Capability prüfen.
6. Stage-B Gates setzen: `POST /api/vip30/live/set-gates?confirm=YES&profile=stage_b`.
7. `GET /api/vip30/live/stage-b/check` prüfen.
8. VIP30-Redemption testen.
9. Slots und Logs minimal prüfen.

Danach: STEP8.5/STEP9 für Alert oder Cleanup-/Revoke-Liveflow planen.
