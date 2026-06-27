# CURRENT_STATUS

Stand: RDAP113_ADMIN_USERS_MODULE_SPLIT  
Datum: 2026-06-27

## Ergebnis

```text
- RDAP109/RDAP109B: Modboard-UI enttechnisiert; Projekterklaerungen aus der normalen Ansicht entfernt.
- RDAP110: Uebersicht als eigenes Frontend-Modul ausgelagert.
- RDAP111/RDAP111B: Diagnose als eigenes Frontend-Modul; Info als kleines Icon, Details im Dialog.
- RDAP112/RDAP112B: Routen aus normalem System-Menue entfernt und als Details / System-Routen vereinfacht.
- RDAP113: Admin-Benutzerverwaltung als eigenes Frontend-Modul eingeordnet.
- Keine Backend-Aenderung, keine DB-Migration, keine Runtime-/Agent-Actions.
```

## UI-Regel

```text
Keine Projekt-Erklaerungen ins Modboard.
Keine Technik-Wand fuer Mods/Streamer.
Bei Fehler: klar sagen, dass Streamer/Admin informiert werden soll.
Technische Details nur bei Bedarf hinter Info oder in Admin-/Details-Bereichen.
```
