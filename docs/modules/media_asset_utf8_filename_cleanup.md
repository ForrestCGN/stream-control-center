# STEP524 – Media Asset UTF-8 Filename Cleanup

## Zweck

Dieser Stand korrigiert die Medienverwaltung direkt im echten Modul `backend/modules/media.js`.

Ziel ist, neue Uploads mit Umlauten sauber zu behandeln und bestehende kaputte Namen/Dateipfade gezielt über eine API zu prüfen oder zu reparieren.

Beispiele für bisherige Artefakte:

- `GewÃ¼rzGurke.mp3`
- `GewA_1_4rzGurke.mp3`
- `GummibA_renbande.mp3`

## Geänderte Datei

- `backend/modules/media.js`

## Neue/angepasste Logik

- Upload-Dateinamen werden vor der Speicherung auf bekannte Mojibake-/Umlaut-Artefakte geprüft.
- Anzeigenamen bleiben lesbar in UTF-8.
- Technische Dateinamen werden ASCII-sicher gespeichert, z. B. `GewuerzGurke.mp3`.
- Bestehende Medien-IDs bleiben erhalten.
- Neue API:
  - `GET /api/media/repair-names`
  - `POST /api/media/repair-names`

## Prüfen ohne Änderung

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/media/repair-names?ids=1393,1395" |
  ConvertTo-Json -Depth 8
```

## Anwenden mit Datei-Umbenennung

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/media/repair-names?ids=1393,1395&apply=true&renameFiles=true" |
  ConvertTo-Json -Depth 8
```

## Hinweise

- `renameFiles=false` repariert nur Metadaten, nicht den Dateinamen auf der Platte.
- `renameFiles=true` benennt die echte Datei im Assets-Ordner um und aktualisiert `relative_path`, `web_path`, `absolute_path` und `file_name` in der bestehenden SQLite-Tabelle.
- Es wird keine neue Datenbank erstellt und keine bestehende Tabelle ersetzt.
