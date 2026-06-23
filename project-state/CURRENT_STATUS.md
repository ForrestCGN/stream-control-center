# CURRENT STATUS

Stand: DASHUI5 / React-Prototyp auf V13-Designbasis angeglichen  
Datum: 2026-06-23

## Aktueller Dashboard-v2-Stand

Aktueller Prototypstand:

```text
DASHUI5 / React-Prototyp auf V13-Designbasis angeglichen
```

Wichtig:

- Die Design-ZIP `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip` ist ab jetzt verbindliche Designreferenz.
- Die Referenz wurde unter `docs/reference/dashboard-v2-design-test-v13/` archiviert.
- React/Vite bleibt die technische Frontend-Basis.
- Die Optik wurde vom generischen Prototyp zurück auf die v13-Designlinie gezogen.

## Geändert durch DASHUI5

- Topbar an v13 angenähert
- Modulname und aktiver Tab inline in der Topbar
- Suchfeld in der Topbar vorbereitet
- Status-Chips in der Topbar vorbereitet
- User-/Sprache-/Bell-Bereich vorbereitet
- Sidebar als kompakter Accordion-Aufbau
- Hauptkategorie -> Modul bleibt Regel
- keine dritte Sidebar-Ebene
- Galaxy-/Glassmorphism-Hintergrund näher an v13
- Content-Flächen kompakter und ruhiger
- Designreferenz unter `docs/reference/dashboard-v2-design-test-v13/` archiviert

## Nicht geändert

- kein Backend-Code
- kein bestehendes lokales Dashboard unter `htdocs/dashboard/`
- kein Build-Output unter `htdocs/dashboard-v2/`
- kein Agent-Code
- keine produktive SQLite
- keine Projekt-Config
- keine OBS-Quelle
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service

## Bekannter Workflow-Punkt

Beim vorherigen `stepdone` wurde sichtbar:

```text
?? frontend/dashboard-v2/...
```

Das bedeutet: `frontend/` wurde nicht automatisch committed.

Für die nächsten Steps muss der Git-/Upload-Workflow angepasst oder bewusst geprüft werden, damit `frontend/dashboard-v2/` auf GitHub/dev landet.

## Nächster sinnvoller Schritt

```text
WF1 / Git-Workflow für frontend/dashboard-v2 prüfen und anpassen
```

Danach:

```text
DASHUI6 / Build- und lokaler Auslieferungsweg prüfen
```
