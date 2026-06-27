# CURRENT CHAT HANDOFF – EVS52.16c Dashboard CSS Restore

Stand: 2026-06-18

## Anlass

Nach EVS52.16b wurde versehentlich `htdocs/dashboard/modules/stream_events.css` durch eine Mini-Datei ersetzt. Dadurch war das Event-System-Dashboard optisch kaputt: Tabs/Buttons wurden vertikal und vollbreit angezeigt.

## Fix

EVS52.16c stellt die vollständige Dashboard-CSS aus dem zuletzt hochgeladenen `htdocs.zip` wieder her und ergänzt nur die kleine `.evs-btn-finale`-Klasse.

## Geändert

- `htdocs/dashboard/modules/stream_events.css`

## Nicht geändert

- Keine Backend-Logik
- Keine Dashboard-JS-Logik
- Keine Chat-/Sound-/Satzlogik
- Keine DB
- Keine Finale-Logik

## Test

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. `stepdone.cmd` ausführen.
3. Dashboard hart neu laden (`STRG+F5`).
4. Tabs müssen wieder horizontal/normal aussehen.
5. Auswertungsbutton bleibt durch EVS52.16b-JS verfügbar, wenn `finaleEligibility.canStart=true`.
