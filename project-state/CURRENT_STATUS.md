# CURRENT_STATUS

Stand: RDAP111B_DIAGNOSTICS_INFO_ICON_AND_DOCS_SYNC  
Datum: 2026-06-27

## Ergebnis

```text
- RDAP109/RDAP109B: Modboard-UI enttechnisiert; Projekterklaerungen aus der normalen Ansicht entfernt.
- RDAP110: Uebersicht als eigenes Frontend-Modul ausgelagert.
- RDAP111: Diagnose als eigenes Frontend-Modul ausgelagert.
- RDAP111B: Diagnose-Info ist jetzt kleines Icon oben rechts in der Kachel statt grossem Button.
- Diagnose-Hauptansicht bleibt fuer Mods/Streamer einfach: OK, Problem, Bereit.
- Technische Details liegen nur im Info-Fenster.
- Keine Backend-Aenderung, keine DB-Migration, keine Runtime-/Agent-Actions.
```

## UI-Regel

```text
Keine Projekt-Erklaerungen ins Modboard.
Keine Technik-Wand fuer Mods/Streamer.
Bei Fehler: klar sagen, dass Streamer/Admin informiert werden soll.
Technische Details nur bei Bedarf hinter Info.
```
