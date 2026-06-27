# RDAP77B_MODULE_REGISTRY_PANEL_MOUNT_AND_VISIBILITY_FIX

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Frontend-only Korrekturstep auf RDAP77

## Ausgangslage

RDAP77 hat die Modul-/Page-Registry begonnen und Admin-Unterseiten in die Registry gebracht.

Im Browser-Test wurde sichtbar:

```text
Admin-Notizen ist sichtbar.
User-Detail ist im Admin-Menue vorhanden.
Beim Klick auf User-Detail wird User-Detail aktiv,
aber das User-Detail-Panel erscheint unterhalb der Admin-Notizen statt als eigene saubere Seite.
```

Das bedeutet:

```text
Navigation/Page-State teilweise richtig.
Panel-Mounting/Sichtbarkeit noch falsch.
```

## Ziel RDAP77B

```text
- Registry-/Router-State und sichtbare Panels sauber zusammenfuehren.
- Inaktive Panels wirklich verstecken.
- Admin-Notizen und User-Detail duerfen nicht gleichzeitig sichtbar bleiben.
- User-Detail erscheint als eigene Seite an der Content-Position, nicht unter Admin-Notizen.
- Kein Backend.
- Keine DB.
- Keine Permission.
- Kein Delete/Deactivate.
```

## Geaendert

### remote-modboard.js

```text
setPage(page, meta) setzt jetzt fuer alle data-page-panel:
- active = panel.dataset.pagePanel === currentPage
- panel.hidden = !active
- is-active-view nur auf dem aktiven Panel
```

Zusaetzlich wurden robuste Hide-Regeln fuer Panels ergaenzt:

```text
[data-page-panel][hidden] { display:none!important }
.rdap-view:not(.is-active-view) { display:none!important }
[data-page-panel="admin-notes"].is-active-view { display:grid!important }
```

Damit kann die alte Admin-Notes-Grid-Regel kein hidden Panel mehr sichtbar halten.

### rdap28-admin-notes.js

```text
- injizierte Admin-Notes/User-Detail Panels starten hidden=true.
- lokale Sync-Funktion versteckt jetzt alle data-page-panel und aktiviert genau die gewaehlte Page.
- eigene Admin-Notes-Display-Regeln respektieren hidden/inactive.
```

## Nicht geaendert

```text
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine neuen Schreibbuttons.
```

## Erwarteter Browser-Zustand

```text
Admin -> Admin-Notizen:
- Header: Admin-Notizen · read/create
- Navigation: Admin-Notizen aktiv
- Nur Admin-Notizen sichtbar

Admin -> User-Detail:
- Header: User-Detail · read-only
- Navigation: User-Detail aktiv
- Nur User-Detail sichtbar
- Admin-Notizen nicht oberhalb stehen geblieben
```
