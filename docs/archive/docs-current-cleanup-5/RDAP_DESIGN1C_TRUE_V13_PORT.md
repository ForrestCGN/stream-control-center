# RDAP_DESIGN1C_TRUE_V13_PORT

Datum: 2026-06-24
Status: von Forrest als fertiger Designstand bestätigt

## Zweck

`RDAP_DESIGN1C_TRUE_V13_PORT` ersetzt die vorherigen ungenauen Design-Annäherungen durch einen deutlich näheren Port der bereitgestellten Designbasis `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE`.

Ziel war nicht, neue Funktionen zu bauen, sondern die vorhandene Remote-Modboard-Oberfläche optisch und strukturell näher an Dashboard-v2/V13 zu bringen.

## Bestätigter Design-Ansatz

Übernommen bzw. als feste Richtung bestätigt:

```text
cgn-galaxy
cgn-topbar
cgn-layout
cgn-sidebar
cgn-nav
nav-group / nav-sub / nav-link
cgn-content
page-header
cgn-card
cgn-chip
```

Die RDAP-Inhalte, IDs und API-Bindings bleiben erhalten. Die V13-Struktur dient als visuelle und layouttechnische Basis für die nächsten Remote-Modboard-Schritte.

## Geänderte Dateien im Design-Step

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
```

## Bewusst nicht geändert

```text
remote-modboard/backend/src/**
remote-modboard/backend/server.js
remote-modboard/backend/package.json
Auth-/OAuth-/Session-Backend
DB-Struktur
Routenlogik
Remote-Writes
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
```

## Ergebnis

- Login-/Denied-Screen im CGN-/Neon-Galaxy-/V13-Stil
- Dashboard mit V13-naher Topbar
- Dashboard mit V13-naher Sidebar-/Accordion-Struktur
- Content-Cards im V13-Glassmorphism-Look
- vorhandene Status-/Diagnose-/Routen-/Auth-Anzeigen bleiben erhalten
- zentrale Login-Vorbereitung bleibt erhalten
- keine produktiven Steueraktionen aktiviert

## Hinweise für nächste Arbeiten

Weitere UI-Arbeiten am Remote-Modboard sollen ab jetzt auf diesem V13-Port aufbauen. Nicht wieder auf die älteren Zwischenstände `RDAP_DESIGN1` oder `RDAP_DESIGN1B` zurückfallen.

Bei neuen Modboard-Seiten gilt:

```text
- V13-Klassen/Struktur weiterverwenden
- keine frei erfundene zweite Dashboard-Struktur bauen
- Sidebar nur Kategorie -> Seite/Modul, keine dritte Sidebar-Ebene
- Moduldetails innerhalb der Seite/Tabs darstellen
- produktive Aktionen erst mit Auth/Permission/Audit/Locking
```

## Offene Punkte

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt.
- EngelCGN/Freigaben nur über sichere Allowlist/Role-Struktur erweitern.
- Nächster sinnvoller Feature-Step: Rollen-/Rechte-/Allowlist-UI planen und bauen.
