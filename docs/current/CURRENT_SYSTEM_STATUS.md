# CURRENT_SYSTEM_STATUS – Command-System / Medienverwaltung

## Command-System

Aktueller stabiler Core: `STEP273A1` plus spätere Dashboard-/Catalog-Erweiterungen.

Bestätigt:
- Backend-Command-System funktioniert.
- Twitch-Chat-Hook funktioniert, wenn Twitch-Presence aktiv ist.
- Deathcounter-Modul wird über Commands erreicht.
- Logs und History-Alias funktionieren.

Wichtig:
- Echte Chat-Commands benötigen aktive Twitch-Presence.
- Nach Backend-Neustart muss Twitch-Presence ggf. wieder gestartet werden, falls sie nicht automatisch aktiv ist.

## Command Catalog

Aktuell:
- `/api/commands/catalog` existiert.
- Deathcounter-Katalog bestätigt.
- STEP273C2 erweitert Katalog um Hug/Rehug und trennt Tagebuch/Todo.

Regel:
- Neue Module müssen Command-Catalog-Daten liefern oder im zentralen Katalog ergänzt werden.

## Medienverwaltung

Aktueller stabiler Core: `STEP274A1C`.

Bestätigt:
- `media.js` wird geladen.
- `/api/media/status` funktioniert.
- `/api/media/list?type=audio` funktioniert.
- `/api/media/list?type=video` funktioniert.
- 258 Medien registriert.

Noch offen:
- STEP274B Media Dashboard anwenden/testen.
- Command-Anbindung an Medienverwaltung in STEP274C.

## Bekannte Altlasten

Beim Scan wurden ungültige/kaputte Legacy-Audiodateien gesehen:
- `leer.mp3`
- `test_ping.wav`

Diese Dateien blockieren den Media-Core nicht mehr. Später im Dashboard als kaputt markieren/löschen.
