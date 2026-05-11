# PROJECT DOCUMENTATION MAP - stream-control-center

Stand: 2026-05-11

## Zweck

Diese Datei ist die schnelle Orientierung, welche Doku-Datei wofuer genutzt werden soll. Sie ersetzt nicht die STEP-Historie, sondern sortiert die Nutzung.

## Aktive Arbeitsdokumente

| Datei | Zweck | Nutzung |
|---|---|---|
| `docs/current/CURRENT_SYSTEM_STATUS.md` | Kompakter aktueller Systemstand | Erster Einstieg fuer neue Chats/Module |
| `project-state/CURRENT_STATUS.md` | Ausfuehrlicher Projektstatus | Referenz fuer detaillierte Projektlage |
| `project-state/CHANGELOG.md` | Chronologische Aenderungen | Commit-/STEP-Historie kurz nachhalten |
| `project-state/FILES.md` | Betroffene Dateien je STEP | Nachvollziehen, was geaendert wurde |
| `project-state/NEXT_STEPS.md` | Naechste Aufgaben | Priorisierte Weiterarbeit |
| `docs/current/DEATHCOUNTER_DB_STORAGE_STABLE_2026-05-11.md` | Stabiler DeathCounter-DB-Storage-Stand | Referenz fuer DeathCounter nach STEP259/STEP260 |

## Historische Referenzdokumente

Diese Dateien dienen als alte Snapshots. Sie duerfen gelesen werden, sollen aber nicht als aktueller Stand behandelt werden.

```text
docs/backend/Backend_Systemuebersicht_2026-05-03.txt
docs/dashboard/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt
docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt
docs/overlays/overlay_iststand_analyse.txt
docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt
```

## STEP-Dateien

`project-state/STEP*.md` bleiben die technische Historie. Sie sind wichtig fuer Nachvollziehbarkeit, aber nicht als taeglicher Einstieg geeignet.

Empfohlene Nutzung:

1. Zuerst `CURRENT_SYSTEM_STATUS.md` lesen.
2. Dann `CURRENT_STATUS.md` und `NEXT_STEPS.md` pruefen.
3. Erst danach passende STEP-Datei oeffnen, wenn Details benoetigt werden.

## Dateien, die spaeter archiviert/sortiert werden sollten

Nicht sofort loeschen. Erst in einem separaten Archiv-STEP verschieben.

```text
project-state/*APPEND*.md
project-state/*STATUS_NOTE*.md
docs/current/*STATUS_NOTE*.md
docs/handoffs/NEXT_CHAT_HANDOFF_*.md
```

Empfohlenes spaeteres Ziel:

```text
project-state/archive/appends/
project-state/archive/status-notes/
docs/archive/handoffs/
docs/archive/old-current-notes/
```

## Namensregeln ab jetzt

Neue Dateien:

```text
project-state/STEP###_KURZER_NAME_YYYY-MM-DD.md
docs/current/<THEMA>_YYYY-MM-DD.md
```

Nicht mehr bevorzugen:

```text
*_APPEND_*.md als dauerhafte Arbeitsbasis
*_STATUS_NOTE_*.md fuer langfristige Referenz
mehrere unklare Dateien zum selben STEP ohne klare Einordnung
```

## Grundregel

Historie bleibt erhalten. Aktive Arbeit soll aber ueber wenige, klare Einstiegspunkte laufen.


## Aktueller DeathCounter-Hinweis

DeathCounter V2 ist nach STEP260 als DB-only produktiv dokumentiert. Fuer DeathCounter-Storage-Fragen zuerst lesen:

```text
docs/current/DEATHCOUNTER_DB_STORAGE_STABLE_2026-05-11.md
```

Die STEP-Dateien 252-259 bleiben technische Historie. Die stabile Zusammenfassung steht in der Current-Doku.
