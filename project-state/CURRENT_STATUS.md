# CURRENT STATUS

Stand: RDAP1 + DASHUI1 / Dashboard-v2 Designrichtung dokumentiert
Datum: 2026-06-22

## Aktueller Runtime-Stand

Der bestätigte Runtime-Stand aus RDAP1/HT4.3 bleibt unverändert.

Central Event Overlay:

- `htdocs/overlays/central_event_overlay.html`
- Version `0.1.3`
- Step `HT4.3`
- HypeTrain Start, Level-Up, Ende und Rekord wurden sichtbar getestet.
- Overlay ist am Communication Bus verbunden.
- Kein separates HypeTrain-Overlay-System wird gebaut.

## RDAP1 / Remote Dashboard Agent Plan

Dokumentiert:

- `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`

Festgelegt:

- Priorität bleibt die sichere Webserver↔Stream-PC-Anbindung.
- Webserver wird öffentliche Zentrale.
- Stream-PC wird lokaler Agent/Ausführer.
- Verbindung später aktiv vom Stream-PC zum Webserver per WSS/WebSocket.
- Keine Portfreigabe am Stream-PC.
- Remote-Actions nur über Allowlist.
- Jede Remote-Aktion braucht Rechteprüfung, requestId, expiresAt, Ergebnisantwort und Audit.
- Multi-User und Bearbeitungs-Locks werden von Anfang an eingeplant.
- Lokale Dashboard-Rollen/Rechte entscheiden konkret.
- Spezialrolle `Sound-Profi` ist geplant.

## DASHUI1 / Dashboard-v2 Design- und Frontend-Richtung

Neu dokumentiert:

- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`

Dieser Stand hält die bestätigte Dashboard-v2-Designrichtung aus den isolierten Design-Tests v8 bis v13 fest.

Bestätigte Designrichtung:

- CGN-Dark-/Neon-/Galaxy-Stil.
- Ruhiger blau/lila Vision-UI-artiger Hintergrund mit dezenter Dot-/Star-Struktur.
- Glassmorphism-Karten, Neon-Lila/Cyan/Blau, hohe Lesbarkeit.
- Topbar fixed mit Scroll-Rand-Effekt.
- Sidebar fixed auf Desktop, Drawer unter ca. 1180px.
- Sidebar-Regel: Hauptkategorie → Modul.
- Keine dritte Sidebar-Ebene.
- Modul-Navi/Tabs innerhalb der Modulseite.
- Topbar zeigt `Hauptbereich` und darunter `Modul • aktiver Tab`.
- Der aktive Tab steht inline hinter dem Modulnamen, getrennt mit `•`.
- Normale Streamer-/Mod-Seiten bleiben einheitlich, einfach und ohne technischen Schnickschnack.
- Technische Details, tiefe Configs, Diagnose, Rohdaten und Spezialaktionen liegen im Admin.

Frontend-Richtung:

- Aufgrund der Projektgröße ist `React + Vite` die bevorzugte Richtung für Dashboard-v2.
- Kein Creative-Tim-/Vision-UI-Code kopieren.
- Creative Tim / Vision UI dient nur als Design- und Komponenten-Inspiration.
- Eigenes CGN-Designsystem mit wiederverwendbaren Komponenten.
- Module sollen über Registry/Definitionen leicht erweiterbar und umstrukturierbar bleiben.

Wichtigster bestätigter Design-Teststand aus dem Chat:

- `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip`

## Nicht geändert durch DASHUI1

- kein Backend-Code
- kein produktives Dashboard
- keine DB-Änderung
- keine Config-Änderung
- keine OBS-Änderung
- kein Agent-Code
- kein Auth-/Permission-Code
- keine Runtime-Datei
- keine React-/Vite-Projektdateien

## Dokumentation

Neu/aktualisiert:

- `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`
- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
