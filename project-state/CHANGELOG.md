# CHANGELOG - VIP30 STEP8.3.2

- STEP8.3.2: Stage-A Safety nutzt fuer den lokalen Reward jetzt einen operationalen Check statt nur strict `linked_in_sync`.
- Fix fuer Event-Ablauf: Blocker `localRewardLinked` soll nicht mehr ausloesen, wenn der lokale `vip30`-Reward operativ korrekt ist (Reward-Key, Kosten, Action, Twitch-Reward-ID, enabled, nicht pausiert, autoFulfill=false).
- Weiterhin kein Fulfill/Cancel und kein Alert.

# CHANGELOG - VIP30

## 0.8.3 - STEP8.3

- Stage-A-Live-Ausführung eingebaut.
- EventSub-Redemption kann bei gesetzten Gates Twitch Add VIP ausführen.
- Erfolgreicher Grant schreibt einen aktiven VIP30-Slot.
- Fulfill/Cancel und Alert bleiben gesperrt.
- Neue Check-Route `/api/vip30/live/stage-a/check`.
- Neue manuelle Route `/api/vip30/redeem/live-stage-a`.


## VIP30 STEP8.3.2
- Version 0.8.3.2 / build step8.3.2-stage-a-local-reward-operational-fix.
- Stage-A Live-Ausfuehrung aktualisiert vor dem VIP-Grant Capability und Config frisch.
- Block-Logs enthalten nun konkrete Stage-A-Blocker.
- Fulfill/Cancel und Alert bleiben weiterhin deaktiviert.
