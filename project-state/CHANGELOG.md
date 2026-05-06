# Changelog

## 2026-05-06

### STEP193.17.2 - SoundAlerts Final Documentation Sync

- Zentrale Projekt-Dokus nach `STEP193.17.1` synchronisiert.
- Dokumentiert:
  - `soundalerts_bridge` Version `0.1.14`
  - Parser-Formate als dashboardfaehige Settings
  - Review-Workflow fuer neue SoundAlerts
  - automatische Ausgabe nach Medientyp/globalem Audio-/Video-Ziel
  - Filter-Regression-Fix aus `STEP193.17.1`
  - lokaler Overlay-Test und temporaerer Overlay-Test-Override
  - offene Overlay-Bugs als naechster Schwerpunkt
- Keine Code-/API-/DB-Aenderung.

### STEP193.17.1 - SoundAlerts Filter Regression Fix

- Regression im Eintraege-Filter behoben.
- `ruleMatchesFilter` nutzt wieder den aktiven globalen Filter, wenn kein expliziter Filterwert uebergeben wird.
- Filter fuer Alle/Aktiv/Inaktiv/Zur Pruefung/Datei fehlt/Ignoriert funktionieren wieder ueber die zentrale Statuslogik.
- Keine Backend-/API-/DB-Aenderung.

### STEP193.17 - SoundAlerts Output Field Cleanup

- Manuelles Ausgabe-Dropdown aus dem Eintrag-Editor entfernt.
- Ausgabeziel wird automatisch aus Medientyp und globalen Audio-/Video-Zielen bestimmt.
- Audio nutzt das globale Audio-Ziel, Video nutzt das globale Video-Ziel.
- Beim Wechsel von Audio/Video bleibt die automatische Zielzuordnung erhalten.
- Keine Backend-/API-/DB-Aenderung.

### STEP193.16 - SoundAlerts Entry Editor Output/Selection Fix

- `soundalerts_bridge` auf Version `0.1.14` gesetzt.
- Ausgabeziel im Eintrag-Editor orientiert sich an Medientyp und globalem Audio-/Video-Ziel.
- Wechsel von Audio/Video setzt das passende Ausgabeziel.
- Nach Upload/Speichern bleibt der aktuell bearbeitete SoundAlert ausgewaehlt.
- Wenn der Eintrag durch Speichern den Filterbereich verlaesst, wechselt die Ansicht auf `Alle`, statt auf den naechsten Eintrag zu springen.
- Keine DB-Schemaaenderung.

### STEP193.15 - SoundAlerts Test Output Override

- `soundalerts_bridge` auf Version `0.1.13` gesetzt.
- `/api/soundalerts/test/chat` akzeptiert optional `outputTarget`.
- Normaler Test nutzt weiterhin das gespeicherte Ausgabeziel.
- Overlay-Test sendet temporaer `outputTarget: overlay`.
- Gespeicherter Eintrag bleibt unveraendert.
- Keine DB-Schemaaenderung.

### STEP193.14 - SoundAlerts Local Overlay Test Workflow

- Button `Lokales Overlay` im Dashboard ergaenzt.
- Lokaler Overlay-Test-Bereich unter `Bot & Settings` ergaenzt.
- Eintraege zeigen ihr Ausgabeziel.
- Ausgabeziel im Eintrag-Editor bearbeitbar gemacht.
- Hinweise fuer Overlay-/Device-Test ergaenzt.
- Doppelte Status-Chips bei fehlender Datei reduziert.

### STEP193.13 - SoundAlerts Entry Test Buttons

- Eintragskarten um Test-Button ergaenzt.
- Detail-Editor auf Icon-Aktionen umgestellt.
- Test-Button wird nur bei vorhandener Datei angezeigt.
- Test nutzt bestehende Route `/api/soundalerts/test/chat`.

### STEP193.12 - SoundAlerts Parser Formats Dashboard Editor

- Bereich `Chat-Erkennung` unter `Bot & Settings` ergaenzt.
- Parser-Formate im Dashboard sichtbar und bearbeitbar gemacht.
- Formate aktiv/inaktiv schaltbar.
- Lokaler Parser-Test ohne Event-/DB-Eintrag ergaenzt.
- Speichern schreibt `parser.messageFormats` ueber Settings-API.

### STEP193.11.1 - SoundAlerts Parser Settings Serialization Fix

- `soundalerts_bridge` auf Version `0.1.12` gesetzt.
- `parser.messageFormats` wird korrekt als Objekt-Array geladen/gespeichert.
- Kaputte `[object Object]`-Werte fallen auf Default-Formate zurueck.

### STEP193.11 - SoundAlerts Configurable Parser Formats

- `soundalerts_bridge` auf Version `0.1.11` gesetzt.
- Parser-Formate ueber `parser.messageFormats` konfigurierbar gemacht.

### STEP193.10 - SoundAlerts Parser Format Fix

- `soundalerts_bridge` auf Version `0.1.10` gesetzt.
- Parser erkennt zusaetzlich Format `loest ... mit ... aus`.

### STEP193.9 - SoundAlerts Stable Handoff / Doku-Sync

- Stabilen SoundAlerts-Zwischenstand nach STEP193.8.1 dokumentiert.
