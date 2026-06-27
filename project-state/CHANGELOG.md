# Changelog

## Version 0.2.10C - Dashboard-v2 V13/Modboard-Design wirklich uebernommen

- Design-Wahrheiten fuer Dashboard-v2 festgehalten:
  - `docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md`
  - `docs/reference/dashboard-v2-design-test-v13/`
  - `remote-modboard/backend/public/index.html`
  - `remote-modboard/backend/public/assets/remote-modboard.css`
  - `remote-modboard/backend/public/assets/remote-modboard.js`
- Lokales Dashboard-v2 weiter an V13/Remote-Modboard angenaehert.
- Topbar, Sidebar und Uebersicht neu aufgebaut.
- `body.is-scrolled .cgn-topbar` fuer hellen Rand/Glow/Shadow beim Scrollen vorbereitet.
- Navigation auf `System`, `Module`, `Admin` reduziert.
- `System -> Stream-PC` aktiv/read-only beibehalten.
- Nur bestehende GET-Routen verwendet:
  - `/api/_status`
  - `/api/stream-status/current`
  - `/api/diag/ws`
- `/dashboard` und Backend nicht geaendert.
- Keine DB-Migration, keine produktiven Writes und kein Webserver-Deploy.
- Sichttest-Hinweis: Topbar ist lokal weiterhin nicht final sauber. Naechster Pflicht-Fix: `0.2.10D - Dashboard-v2 Topbar V13 exakt nachziehen`.

## Version 0.2.10B - Dashboard-v2 Modboard-Layout exakt angeglichen

- Dashboard-v2 Layout/Navigation deutlich naeher an echte Online-Modboard-Struktur angeglichen.
- Topbar mit Breadcrumb, deaktivierter Suche, Quick-Chips und lokalem Userbereich vorbereitet.
- Sidebar wie Online-Modboard: fixed, gleiche Gruppenlogik, gleiche aktive Link-Markierung, Footer.
- Stream-PC Status read-only unter `System -> Stream-PC` vorbereitet.
- Nur bestehende lokale GET-Routen verwendet:
  - `/api/_status`
  - `/api/stream-status/current`
  - `/api/diag/ws`
- Keine Refresh-, Test-, Log-, Session- oder Schreibroute aufgerufen.
- Keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions.
- `/dashboard` bleibt unveraendert.
- Kein Webserver-Deploy noetig.

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
