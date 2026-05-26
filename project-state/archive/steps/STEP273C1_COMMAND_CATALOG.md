# STEP273C1 – Modul-Command-Catalog

## Ziel

Modul-Commands im Command-Dashboard sollen nicht mehr komplett frei per Modul/Action/URL erraten werden müssen.

## Änderungen

- Backend-Command-System bekommt einen Modul-Command-Katalog:
  - `GET /api/commands/catalog`
  - Kategorien und Actions für Deathcounter als echte erste Gruppe
  - vorbereitete Kategorien für Community, Clips, Tagebuch/Todo und System/Medien
- Dashboard-Commands-Modul bekommt bei `Action-Typ: Modul-Command`:
  - Kategorie-Dropdown
  - Modul-Aktion-Dropdown
  - Infofeld mit Modul, URL, Beispiel und Beschreibung
  - Icon-Button `↩️` zum Übernehmen der Defaults
- Backend-Target-Payload unterstützt:
  - `config.moduleCommand`
  - `config.defaultArgs`
  - Dadurch können Commands wie `!dcshow` intern `dcount show` an das Modul senden.

## Wichtig für zukünftige Module

Neue Module sollen künftig ihren Command-Katalog pflegen oder im zentralen Command-Catalog ergänzt werden.

Mindestens angeben:

- Kategorie
- Label
- Modul-Key
- Action-Key
- Ziel-URL
- Methode
- Default-Trigger
- Default-Aliase
- Rechte
- Cooldowns
- Beispiele
- optionale `config.moduleCommand` und `config.defaultArgs`

## Bewusst nicht enthalten

- Keine zentrale Medienverwaltung.
- Kein Upload.
- Keine MP3-/Video-Ausführung.
- Keine Migration bestehender Module.
- Keine Entfernung bestehender Command-Funktionalität.

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/catalog"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute?message=!dcshow&user=forrestcgn&role=mod"
```
