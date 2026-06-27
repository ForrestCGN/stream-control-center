# Changelog

## Version 0.2.10 - Stream-PC Status read-only vorbereitet

- Lokalen Dashboard-v2 Menuepunkt `System -> Stream-PC` aktiviert.
- Neue Read-only-Seite fuer lokalen Stream-PC Status erstellt.
- Nur bestehende GET-Routen verwendet:
  - `/api/_status`
  - `/api/stream-status/current`
  - `/api/diag/ws`
- Server-, Modul-, Routen-, WebSocket- und gecachter Streamstatus sichtbar gemacht.
- Keine Refresh-, Test-, Log-, Session- oder Schreibroute aufgerufen.
- Keine Buttons, Actions oder Steuerfunktionen aktiviert.
- Produktions-Build unter `htdocs/dashboard-v2/` aktualisiert.
- `/dashboard` und Backend nicht geaendert.
- Keine DB-Migration, keine produktiven Writes und kein Webserver-Deploy.

## Version 0.2.9 - Dashboard-v2 Navigation angeglichen

- Lokale Dashboard-v2 Navigation strukturell an das Online-Modboard angeglichen.
- Hauptbereiche `System`, `Module` und `Admin` als gemeinsame Basis aufgenommen.
- Sichtbare Online-Unterpunkte als geplante, deaktivierte Navigation aufgenommen.
- Lokale Zukunftsbereiche `Aktionen`, `Loyalty`, `Media` und `Overlays` beibehalten.
- Nur `System -> Uebersicht` ist aktiv.
- Keine Online-Adminfunktion, API oder Action kopiert oder freigeschaltet.
- Produktions-Build unter `htdocs/dashboard-v2/` aktualisiert.
- `/dashboard` und Backend nicht geaendert.
- Keine DB-Migration, keine produktiven Writes und kein Webserver-Deploy.
