# NEXT_STEPS

## Naechster technischer Schritt

`RDAP_0.2.56_MEDIA_INDEX_READ_SOURCE`

Ziel:

- Remote-Modboard-Media-Lesequelle kontrolliert auf `remote_media_index` umstellen.
- DB-Reads nur read-only ueber die bestehende Remote-Modboard-MariaDB-Schicht.
- Agent-Memory als Fallback/Status sichtbar halten.
- Paging/Suche/Sortierung auf DB-Read vorbereiten oder direkt sauber anbinden.

## Grenzen

- Keine Upload/Edit/Delete-Buttons.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Keine Online->Agent-Dateiaktionen.
- Keine Delta-Sync-Logik in diesem naechsten Schritt.
