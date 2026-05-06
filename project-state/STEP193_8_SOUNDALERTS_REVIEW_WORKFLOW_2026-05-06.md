# STEP193.8 - SoundAlerts Review Workflow

Stand: 2026-05-06

## Ziel

Automatisch erkannte SoundAlerts sollen nicht mehr zu frueh wie fertig wirken. Ein automatisch zugeordneter Eintrag bleibt im Dashboard **Zur Pruefung**, bis er gespeichert/freigegeben wurde.

## Geaendert

- `file_matched` und `review_required` werden im Dashboard als `Zur Pruefung` angezeigt.
- `Zur Pruefung` zaehlt als echte Handlung, auch wenn bereits eine Datei gefunden wurde.
- `Eintraege > Filter` enthaelt jetzt `Zur Pruefung`.
- `Aktiv` zaehlt nur noch wirklich aktive/freigegebene Eintraege.
- Beim Speichern/Freigeben wird ein gueltiger Eintrag automatisch auf `active` gesetzt.
- Wenn ein gueltiger Eintrag bewusst deaktiviert gespeichert wird, wird er auf `inactive` gesetzt.
- Eintraege mit fehlendem Namen oder fehlender/Platzhalter-Datei bleiben `missing_file`.
- Der Ignorieren-Button wurde aus den normalen Karten entfernt und bleibt nur weniger prominent im Editor verfuegbar.

## Nicht geaendert

- Keine Backend-Route geaendert.
- Keine DB-Migration.
- Keine bestehende SoundAlerts-API entfernt.
- `ignored` bleibt technisch verfuegbar.

## Betroffene Dateien

- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Test

```text
node --check htdocs/dashboard/modules/soundalerts.js
```

## Pruefung im Dashboard

- SoundAlerts > Uebersicht: `Zur Pruefung` sichtbar, wenn automatisch erkannte Eintraege noch nicht gespeichert wurden.
- SoundAlerts > Eintraege: Filter `Zur Pruefung` zeigt diese Eintraege.
- Nach `Speichern / Freigeben` wird der Eintrag aktiv oder bewusst inaktiv.
