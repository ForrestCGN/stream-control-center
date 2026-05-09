# NEXT STEPS APPEND - STEP202

## Nächster empfohlener Schritt

### STEP203 - Loyalty Core DB + Basis-API Plan

Vor STEP203 müssen echte StreamElements-Daten oder Screenshots geprüft werden.

Erst erfassen:

1. Loyalty Settings vollständig sichern.
2. User-Punkte exportieren oder Importweg klären.
3. Stream Store / Reward-Items erfassen.
4. Giveaway-Settings und Historie prüfen.
5. Aktive Chat-Games und Settings erfassen.
6. Gewünschte Commands/Aliase festlegen.
7. Priorität für Dashboard und Overlays festlegen.

Danach STEP203 technisch planen:

```text
backend/modules/loyalty.js
config/loyalty.json
/api/loyalty/status
/api/loyalty/settings
/api/loyalty/balance/:login
loyalty_users
loyalty_transactions
loyalty_settings
loyalty_reservations
loyalty_imports
loyalty_ignored_users
```

Regel:

```text
Keine StreamElements-Abschaltung und keine produktive Punkte-Migration, bevor Importdaten geprüft wurden.
```
