# CHANGELOG

## 2026-06-27 - RDAP113B_HIDE_DETAILS_NAV

```text
- Details-Navigation aus der Sidebar entfernt.
- System-Routen bleiben nicht als normaler Menuepunkt sichtbar.
- Keine Backend-Aenderung, keine DB-Migration, keine Agent-Actions.
```

## 2026-06-27 - RDAP113_ADMIN_USERS_MODULE_SPLIT

```text
- Admin-Benutzerverwaltung als eigenes Frontend-Modul `assets/modules/admin/users.js` eingeordnet.
- Benutzerverwaltung wird aus dem normalen Admin-Menue entfernt und als eigener Bereich `Benutzer` registriert.
- Ansicht bleibt read-only; keine neuen Schreibfunktionen.
- Keine Backend-Aenderung, keine DB-Migration, keine Agent-Actions.
```

## 2026-06-27 - RDAP112/RDAP112B

```text
- Routen aus normalem System-Menue entfernt.
- Details / System-Routen stark vereinfacht.
- Doku und UI-Code synchronisiert.
```

## 2026-06-27 - RDAP111B_DIAGNOSTICS_INFO_ICON_AND_DOCS_SYNC

```text
- Diagnose: grosser Info-Button je Kachel durch kleines Info-Icon oben rechts ersetzt.
- Info-Dialog bleibt erhalten.
- Hauptansicht bleibt mod-/streamer-tauglich und zeigt keine technischen Details als Dauertext.
- Doku/Prompt auf Stand RDAP111B aktualisiert.
```

## 2026-06-27 - RDAP110/RDAP111

```text
- Uebersicht in assets/modules/system/overview.js ausgelagert.
- Diagnose in assets/modules/system/diagnostics.js ausgelagert.
- Shell bleibt Shell; Bereiche werden schrittweise eigene Module.
```
