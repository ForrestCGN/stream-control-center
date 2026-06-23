# TODO

Stand: DASHUI4 / Minimaler React-Vite-Prototyp gebaut  
Datum: 2026-06-23

## Offen / als nächstes

### DASHUI5 / Build- und lokaler Auslieferungsweg prüfen

- [ ] `cd frontend/dashboard-v2`
- [ ] `npm install`
- [ ] `npm run build`
- [ ] prüfen, ob `htdocs/dashboard-v2/` erzeugt wird
- [ ] prüfen, ob Assets korrekt referenziert werden
- [ ] lokalen Aufruf über `/dashboard-v2/` prüfen
- [ ] altes Dashboard unter `/dashboard` gegenprüfen
- [ ] kein Backend ändern
- [ ] keine produktiven Aktionen ausführen

## DASHUI4 erledigt

- [x] `frontend/dashboard-v2/` angelegt
- [x] React + Vite Grundgerüst gebaut
- [x] AppShell gebaut
- [x] Sidebar-Regel Hauptkategorie -> Modul vorbereitet
- [x] Topbar mit `Hauptbereich` und `Modul • aktiver Tab` gebaut
- [x] PageHeader gebaut
- [x] ModuleTabs gebaut
- [x] CGN-Theme/Theme angelegt
- [x] Modul-Registry vorbereitet
- [x] Navigation-Registry vorbereitet
- [x] Beispielseite `Übersicht`
- [x] Beispielseite `Remote Agent`
- [x] keine produktive Modulmigration
- [x] keine Schreibfunktion
- [x] kein Login-Zwang
- [x] altes Dashboard nicht geändert

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

## Login / Remote-Modboard

- [ ] lokales Dashboard-v2 zunächst mit vorbereiteter Auth-Struktur
- [ ] lokalen Dev-/Owner-Kontext später sauber kapseln
- [ ] Webserver-Login separat planen
- [ ] Permission-Auswertung serverseitig planen
- [ ] keine Secrets ins Frontend
- [ ] produktive Agent-Aktionen nur mit Permission + Lock + Audit

## Alte offene Punkte

### HypeTrain / Central Event Overlay

- [ ] echte HypeTrain-Live-Payloads während echtem HypeTrain prüfen
- [ ] prüfen, ob `central_event_overlay.html` alle relevanten Felder korrekt anzeigt
- [ ] finale Template-/Mode-Struktur für Central Event Overlay planen
- [ ] Level-Up-Sound auswählen und aktivieren, wenn passendes Medium vorhanden ist
- [ ] Ende-Sound auswählen und aktivieren, wenn passendes Medium vorhanden ist

## Nicht vergessen

- keine produktive SQLite löschen, ersetzen, überschreiben oder droppen
- keine alten Dashboard-Dateien blind umbauen
- keine Patch-/Apply-/Regex-/Append-Scripte
- vollständige Dateien mit echten Zielpfaden liefern
- StepDone erst nach Einspielen/Deploy und Test
