# RDAP DASHBOARD1 - Protected Shell

Stand: RDAP_DASHBOARD1_PROTECTED_SHELL
Datum: 2026-06-24

## Ziel

Dashboard1 baut die erste echte geschützte Dashboard-Shell für `mods.forrestcgn.de`.

## Inhalt

- Sidebar Navigation
- Topbar mit eingeloggtem User
- Login-Gate, wenn User nicht angemeldet ist
- geschützte read-only Seiten:
  - Übersicht
  - Diagnose
  - Routen
  - Mein Login
  - Rechte-Diagnose
  - Module read-only
- Logout bleibt sichtbar
- Auto-Refresh bleibt erhalten

## Sicherheit

Weiterhin nicht aktiviert:

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-Steuerung
- keine Sound-Steuerung
- keine Overlay-Steuerung
- keine Command-Steuerung
- keine Migration

## Hinweis

Dashboard1 ist eine geschützte UI-Shell. Produktive Schreibrechte/Actions müssen später separat mit serverseitiger Permission-Middleware, Locking und Audit gebaut werden.
