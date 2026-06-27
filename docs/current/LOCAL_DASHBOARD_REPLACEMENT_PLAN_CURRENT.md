# Lokaler Dashboard-Ersatz - aktueller Plan

Stand: 2026-06-27

## Aktueller Stand

```text
0.2.10C - Dashboard-v2 V13/Modboard-Design wirklich uebernommen
```

`/dashboard-v2/` bleibt der neue lokale Einstieg auf dem bestehenden lokalen Node/Express-Server auf Port 8080. `/dashboard/` bleibt unveraendert.

## Design-Wahrheit

Fuer Dashboard-v2 gilt ab diesem Step:

```text
- docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
- docs/reference/dashboard-v2-design-test-v13/
- remote-modboard/backend/public/index.html
- remote-modboard/backend/public/assets/remote-modboard.css
- remote-modboard/backend/public/assets/remote-modboard.js
```

Die lokale Oberflaeche darf funktional lokal/read-only bleiben, soll optisch aber dem Remote-Modboard/V13 folgen.

## Umgesetzt in 0.2.10C

- Topbar mit Modboard-Struktur: Breadcrumb, Suche, Quick-Chips, Neu-laden-Optik, DE, Lock, Avatar/Userbereich.
- `body.is-scrolled .cgn-topbar` uebernommen: heller Rand/Glow/Shadow beim Scrollen.
- Fixed Sidebar mit System/Module/Admin, aktiver Dot-Markierung und Footer.
- Uebersicht mit Header, Metric-Karten, Aktivitaeten und Schnellzugriff.
- `System -> Stream-PC` aktiv/read-only.
- Nur bestehende GET-Routen:
  - `/api/_status`
  - `/api/stream-status/current`
  - `/api/diag/ws`

## Sicherheitsgrenzen

- keine Backend-Aenderung,
- keine DB-Migration,
- keine produktiven Writes,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- keine Aenderung an `/dashboard`,
- kein Webserver-Deploy noetig.

## Naechster sinnvoller Schritt

```text
0.2.11 - Moduluebersicht read-only vorbereiten
```
