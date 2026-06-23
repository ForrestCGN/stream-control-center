# TODO

Stand: WF1 / Frontend Git Workflow korrigiert  
Datum: 2026-06-23

## Sofort prüfen

- [ ] WF1 installieren
- [ ] `git status --short` prüfen
- [ ] `stepdone.cmd` ausführen
- [ ] prüfen, dass `frontend/dashboard-v2/` nicht mehr untracked ist
- [ ] prüfen, dass GitHub/dev den React-Code enthält

## WF1 erledigt

- [x] `stepdone.cmd` nimmt `frontend/` auf
- [x] JS-Syntaxcheck für `frontend/**/*.js` und `frontend/**/*.jsx` ergänzt
- [x] `tools/upload_streamassets_changes.ps1` kennt `frontend/dashboard-v2/`
- [x] Commit-Hinweise nehmen `frontend` auf
- [x] Sicherheitsblocker bleiben aktiv
- [x] `node_modules`, `dist`, `.vite` bleiben ausgeschlossen

## Danach

### DASHUI6 / Build- und lokaler Auslieferungsweg prüfen

- [ ] `cd frontend/dashboard-v2`
- [ ] `npm.cmd install`
- [ ] `npm.cmd run build`
- [ ] prüfen, ob `htdocs/dashboard-v2/` erzeugt wird
- [ ] prüfen, ob Assets korrekt referenziert werden
- [ ] lokalen Aufruf über `/dashboard-v2/` prüfen
- [ ] altes Dashboard unter `/dashboard` gegenprüfen
- [ ] kein Backend ändern
- [ ] keine produktiven Aktionen ausführen

## Nicht vergessen

- keine produktive SQLite löschen, ersetzen, überschreiben oder droppen
- keine alten Dashboard-Dateien blind umbauen
- keine Patch-/Apply-/Regex-/Append-Scripte
- vollständige Dateien mit echten Zielpfaden liefern
- StepDone erst nach Einspielen/Deploy und Test
