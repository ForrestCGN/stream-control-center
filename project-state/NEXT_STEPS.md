# Next Steps

1. STEP7 entpacken.
2. `node -c backend\modules\vip30.js` ausführen.
3. `stepdone.cmd` ausführen.
4. Erst danach API testen.
5. Bridge-Stats resetten.
6. `live-check` prüfen.
7. Eine echte Channelpoints-Redemption auslösen und beobachten, weiterhin ohne Twitch-Schreibaktionen.
8. Danach Live-Grant-Planung: Add VIP, Slot schreiben, Fulfill/Cancel, Alert.

## Naechste Schritte nach VIP30 STEP7.1

1. STEP7.1 installieren und `node -c backend\modules\vip30.js` ausfuehren.
2. `/api/vip30/channelpoints/reward/ensure?confirm=YES` erneut testen.
3. Falls noetig: `/api/vip30/channelpoints/reward/link-twitch-id?confirm=YES` ausfuehren, um die letzte echte Twitch-Reward-ID lokal zu hinterlegen.
4. Danach Vorbereitung STEP8: echte Redemption nach erfolgreicher Entscheidung fulfillen/canceln, weiterhin mit Safety-Schaltern.


## Nach STEP7.2
1. `node -c backend\modules\vip30.js` ausführen.
2. Node neu starten.
3. `/api/vip30/channelpoints/reward/ensure?confirm=YES` testen.
4. Danach erst STEP8 planen: echte Live-Actions für VIP-Grant + Fulfill/Cancel vorbereitet hinter Safety-Schalter.
