# Changelog

## 2026-05-09

### STEP203.6.1 - Loyalty GiftSub Receiver Booking Fix

- `backend/modules/loyalty.js` korrigiert.
- GiftSub-Events buchen jetzt zusätzlich Receiver-Punkte.
- Event-Metadata enthält `receiver` und `transactions`.
- Duplicate-Schutz bleibt erhalten.
