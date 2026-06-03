# NEXT STEPS after CAN-42.29

## Aktueller Stand

CAN-42.29 ist ein Frontend-only Cleanup für die zentrale Diagnoseanzeige.

Die Dashboard-Datei `htdocs/dashboard/modules/diagnostics.js` zeigt jetzt Registry/Coverage sauber in der Gesamtübersicht an.

## Nächster sinnvoller Schritt

CAN-42.30: Alte nicht mehr geladene Diagnose-Dateien gezielt entfernen.

Vorher prüfen:

- Dashboard hart neu laden.
- Admin > Diagnose > Gesamtübersicht prüfen.
- Einzelmodule öffnen:
  - Communication-Bus
  - OBS
  - VIP-System
  - Sound-System
  - Alerts

Löschkandidaten aus CAN-42.25 erst entfernen, wenn Dashboard und Modulunterseiten stabil geprüft sind.
