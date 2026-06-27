# Changelog

## Version 0.2.10C - Dashboard-v2 V13/Modboard-Design wirklich uebernommen

- Lokale Dashboard-v2 Oberflaeche visuell an Remote-Modboard/V13 angeglichen.
- Topbar-Struktur angepasst: Breadcrumb, Suche, Quick-Chips, Neu-laden-Optik, DE, Lock, Avatar/Userbereich.
- Scroll-Verhalten fuer Topbar uebernommen: `body.is-scrolled .cgn-topbar` mit hellem Rand/Glow/Shadow.
- Sidebar an echtes Modboard angeglichen: fixed Position, Gruppen, aktive Dot-Markierung, Footer.
- Uebersicht an Modboard-Startseite angenaehert: Header, Metric-Karten, Aktivitaeten, Schnellzugriff.
- Navigation auf sichtbare Grundstruktur `System`, `Module`, `Admin` reduziert; lokale Zukunftsbereiche bleiben geparkt.
- `System -> Stream-PC` bleibt aktiv/read-only.
- Nur bestehende GET-Routen verwendet:
  - `/api/_status`
  - `/api/stream-status/current`
  - `/api/diag/ws`
- Keine Refresh-, Test-, Log-, Session- oder Schreibroute aufgerufen.
- Keine Buttons, Actions oder Steuerfunktionen aktiviert.
- Produktionsdateien unter `htdocs/dashboard-v2/` aktualisiert.
- `/dashboard` und Backend nicht geaendert.
- Keine DB-Migration, keine produktiven Writes und kein Webserver-Deploy.

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
