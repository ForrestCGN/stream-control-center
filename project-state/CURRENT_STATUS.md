# CURRENT STATUS

Stand: CAN-9.7

Recovery-Preflight ist weiterhin read-only. Die dedizierte Route `GET /api/bus-diagnostics/recovery-preflight` existiert seit CAN-9.2 und wurde in CAN-9.4 um Route-Kontext/NextStep bereinigt.

Mit CAN-9.7 konsumiert das Dashboard diese Route gezielt und zeigt Route-Kontext sowie Route-Safety im Preflight-Untertab an.

Keine Recovery-Ausführung ist implementiert.
