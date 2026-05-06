# STEP193.16 - SoundAlerts Entry Editor Output/Selection Fix

Stand: 2026-05-06

## Ziel

Kleine Korrektur am SoundAlerts-Eintrag-Editor nach Live-Test.

## Geaendert

- `soundalerts_bridge` Version auf `0.1.14` gesetzt.
- Ausgabeziel orientiert sich jetzt konsequenter am Medientyp und an den globalen Settings:
  - Audio nutzt `soundSystem.audioOutputTarget`.
  - Video nutzt `soundSystem.videoOutputTarget`.
- Beim Wechsel von `Typ` im Editor wird das Ausgabeziel passend zum neuen Typ gesetzt.
- Nach Upload/Speichern bleibt der bearbeitete Eintrag selektiert.
- Wenn der Eintrag durch Speichern in einen anderen Filterbereich wandert, springt das Dashboard nicht mehr auf den naechsten offenen Eintrag, sondern bleibt beim gleichen SoundAlert und wechselt bei Bedarf auf `Alle`.
- Datei-Upload setzt das Ausgabeziel passend zum erkannten Medientyp statt ein altes Ziel blind mitzunehmen.

## Betroffene Dateien

- `backend/modules/soundalerts_bridge.js`
- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Nicht geaendert

- Keine DB-Schemaaenderung.
- Keine SQLite-Daten ersetzt.
- Keine bestehenden Funktionen entfernt.

## Tests

```text
node --check backend/modules/soundalerts_bridge.js
node --check htdocs/dashboard/modules/soundalerts.js
```

## Offen

Das Sound-System Overlay selbst hat weiterhin offene Bugs und soll spaeter separat bearbeitet werden.
