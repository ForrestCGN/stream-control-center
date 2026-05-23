# NEXT STEPS

- STEP274D live deployen und prüfen:
  - `/api/media/status` muss `STEP274D` melden.
  - `/api/media/resolve?id=<id>` muss ein Asset mit Pfaden, Capabilities und Use-Case-Daten zurückgeben.
  - `/api/commands/media-options?type=audio&status=active` muss weiterhin Optionen liefern.
- Danach STEP274E/STEP274D2 planen:
  - `sound_system` media-registry-aware machen.
  - `media/audio/*` über zentrale Media-ID abspielbar machen.
  - Legacy-Sounds weiter kompatibel halten.
  - Erst danach Command-Ausführung für `sound_play` aktivieren.
