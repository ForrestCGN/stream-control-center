# Current Status

Aktueller Arbeitsstand: CAN-42.21 vorbereitet.

Diagnostics-Standard umgesetzt für:

- Commands
- Hug
- Message-Rotator
- VIP-Sound
- Sound-System
- Medienverwaltung
- Alerts
- Birthday
- Overlay-Monitor
- Communication-Bus
- OBS

CAN-42.21 erweitert `backend/modules/obs.js` um standardisierte Status-Diagnostics in `/api/obs/status`, ohne produktive OBS-Aktionslogik zu verändern.


## CAN-42.21b Dashboard Diagnostics Registry Fix
- Ergänzt fehlende Diagnose-Auswahl für Communication-Bus (`/api/communication/status`) und OBS (`/api/obs/status`).
- Korrigiert/erweitert die zentrale Dashboard-Diagnose über bestehende `diagnostics_generic_details.js`.
- Keine Backend-Logik, keine Produktivaktionen, keine neue Moduldatei.
