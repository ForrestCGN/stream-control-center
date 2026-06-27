# TODO_RESCUE_1_SPLIT_ACTIVE_AND_PARKED_TODOS

Stand: 2026-06-27  
Step: `RDAP_TODO_RESCUE_1_SPLIT_ACTIVE_AND_PARKED_TODOS`

## Anlass

Beim Docs-Cleanup wurde `project-state/TODO.md` faelschlich als reine Step-TODO behandelt. Dadurch gingen zentrale Langzeit-/Parkpunkte aus dem sichtbaren Projektstatus verloren.

Dieser Step korrigiert das strukturell:

- `project-state/TODO.md` wird wieder kurze aktive TODO-Liste.
- `project-state/PARKED_TODOS.md` wird neue zentrale Langzeit-Merkstelle fuer zurueckgestellte Arbeit.
- Alte belegte Punkte aus GitHub/dev, Archiv und Git-Historie werden in `PARKED_TODOS.md` rekonstruiert.

## Ergebnis

Neue/aktualisierte Dateien:

```text
project-state/TODO.md
project-state/PARKED_TODOS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/TODO_RESCUE_1_SPLIT_ACTIVE_AND_PARKED_TODOS.md
docs/current/NEXT_CHAT_PROMPT_RDAP_TODO_RESCUE_2.md
```

## Wichtige Entscheidung

`TODO.md` und `PARKED_TODOS.md` haben ab jetzt unterschiedliche Rollen:

| Datei | Zweck |
| --- | --- |
| `project-state/TODO.md` | aktive Kurzfrist-Arbeit / naechster Fokus |
| `project-state/PARKED_TODOS.md` | zentrale Langzeit-Merkstelle fuer zurueckgestellte Punkte |

## Rescue-1-Quellen

Gelesene / ausgewertete belegte Quellen:

```text
docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt
docs/system-inspection/STEP532_TODO_RESCUE_REPORT.md
docs/archive/docs-current-cleanup-7/TODO_EVENT_SOUND_RUNTIME.md
docs/archive/docs-current-cleanup-7/TODO_EVENT_SOUND_DASHBOARD.md
docs/archive/docs-current-cleanup-8/NEXT_TODO_STEP279.md
docs/archive/docs-current-cleanup-7/VIP_STATUS_ROUTE_TODO_CAN42_4D.md
docs/archive/docs-current-cleanup-7/TODO_STREAM_EVENTS_EVS49_38.md
project-state/TODO.md @ 16da32a84a3559d1b147030582530548079c503f
project-state/TODO.md @ 84586b9da1cd3eedce2da9c7190b42f744e517d1
```

## Noch nicht vollstaendig abgeschlossen

Rescue 1 ist bewusst eine strukturierte Wiederherstellung, aber keine vollstaendige Tiefensuche ueber alle alten Archivdateien. `PARKED_TODOS.md` enthaelt daher einen Abschnitt `Noch gezielt nachzurettende Quellen fuer Rescue-2`.

## Grenzen

- Keine Codeaenderung.
- Keine DB-Aenderung.
- Kein Webserver-Deploy.
- Keine Deletes.
- Keine produktiven Writes.
