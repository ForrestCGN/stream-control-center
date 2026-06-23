# TODO

Stand: DASHUI5 / React-Prototyp auf V13-Designbasis angeglichen  
Datum: 2026-06-23

## Offen / als nächstes

### WF1 / Git-Workflow für frontend/dashboard-v2 prüfen und anpassen

- [ ] Workflow-Skripte prüfen, die `git add` ausführen
- [ ] klären, warum `frontend/` nach `stepdone` untracked blieb
- [ ] `frontend/dashboard-v2/` in erlaubte Commit-/Upload-Pfade aufnehmen
- [ ] Sicherheitsblocker für `token`, `secret`, `.env`, `.sqlite`, `.db`, `.zip`, `.7z` beibehalten
- [ ] keine Secrets erlauben
- [ ] nach StepDone prüfen, dass kein `?? frontend/` übrig bleibt

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

## DASHUI5 erledigt

- [x] V13-Design-ZIP als verbindliche Referenz übernommen
- [x] Referenz unter `docs/reference/dashboard-v2-design-test-v13/` archiviert
- [x] Topbar an v13 angenähert
- [x] Modulname und aktiver Tab inline in der Topbar
- [x] Suchfeld in der Topbar vorbereitet
- [x] Status-Chips in der Topbar vorbereitet
- [x] User-/Sprache-/Bell-Bereich vorbereitet
- [x] Sidebar als kompaktes Accordion
- [x] immer nur ein Sidebar-Bereich offen
- [x] Content-Flächen näher an v13
- [x] keine Backend-/DB-/OBS-Änderung

## Dashboard-v2 Migration

- [ ] jedes Modul vor Migration einzeln prüfen
- [ ] alte Dashboard-Funktionen pro Modul vollständig auflisten
- [ ] bestehende API-Endpunkte pro Modul prüfen
- [ ] v2-Modulseiten zuerst read-only bauen
- [ ] Schreibfunktionen erst nach Permission-/Lock-/Audit-Vorbereitung
- [ ] Migrationsstatus je Modul führen:
  - `not_started`
  - `read_only`
  - `write_beta`
  - `v2_preferred`
  - `legacy_retained`
  - `legacy_deprecated`

## Nicht vergessen

- keine produktive SQLite löschen, ersetzen, überschreiben oder droppen
- keine alten Dashboard-Dateien blind umbauen
- keine Patch-/Apply-/Regex-/Append-Scripte
- vollständige Dateien mit echten Zielpfaden liefern
- StepDone erst nach Einspielen/Deploy und Test
