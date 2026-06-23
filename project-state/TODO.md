# TODO

Stand: DASHUI3.DOC1 / Parallelbetrieb und Modul-Migrationsplan dokumentiert  
Datum: 2026-06-23

## Offen / als nächstes

### DASHUI4 / Minimaler React-Vite-Prototyp

- [ ] `frontend/dashboard-v2/` anlegen
- [ ] React + Vite Grundgerüst bauen
- [ ] AppShell bauen
- [ ] Sidebar-Regel Hauptkategorie -> Modul umsetzen
- [ ] Topbar mit `Hauptbereich` und `Modul • aktiver Tab` umsetzen
- [ ] PageHeader bauen
- [ ] ModuleTabs bauen
- [ ] CGN-Tokens/Theme anlegen
- [ ] Modul-Registry vorbereiten
- [ ] Navigation-Registry vorbereiten
- [ ] Beispielseite `Übersicht`
- [ ] Beispielseite `Remote Agent`
- [ ] keine produktive Modulmigration
- [ ] keine Schreibfunktion
- [ ] kein Login-Zwang
- [ ] altes Dashboard nicht ändern

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
