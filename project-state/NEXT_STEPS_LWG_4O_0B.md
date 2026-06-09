# NEXT STEPS – LWG-4O.0b

1. Aktuelle echte `backend/modules/twitch_presence.js` vollständig als Source of Truth verwenden.
2. LWG-4O.1 umsetzen: Chat-Bus-Bridge in `twitch_presence` ergänzen.
3. Bestehenden Command-Direktaufruf beibehalten.
4. Bus-Event leicht halten: no replay, no ACK, ttlMs 0, kein Payload-Audit.
5. Danach Giveaway-Claim-Subscriber separat planen.

StepDone für diesen Plan-Step:

```powershell
.\stepdone.cmd "STEP LWG-4O.0b Chat-Bus-Bridge Umsetzungsplan"
```
