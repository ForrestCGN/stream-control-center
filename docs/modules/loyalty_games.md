# Loyalty Games Modul

Stand: 2026-06-08  
STEP: LWG-4C.1

## Zweck

Loyalty Games enthaelt aktuell Gluecksrad, Presets, Felder und Dreh-Verlauf.

## Neue Regel LWG-4C.1

```text
- Feld: Gesamtmenge eintragen, Standard 1.
- Restmenge wird automatisch berechnet.
- Gewinn nach Auslosung entfernen ist global pro Preset.
- Per-Feld-Remove-Option wird nicht mehr im Dashboard angeboten.
```

## API-Ergaenzung

```text
PUT /api/loyalty/games/wheel/presets/:presetUid
```

Speichert editierbare Preset-Einstellungen.


## Bezug zu Giveaways

Seit LWG-4D existiert `backend/modules/loyalty_giveaways.js` als eigener Loyalty-Unterbereich. Wheel/Presets bleiben eigenständig und werden spaeter von Giveaways genutzt.
