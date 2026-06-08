# Loyalty Wheel / CGN Glücksrad

Stand: 2026-06-08  
STEP: LWG-4C.1

## Mengenregel

```text
Gesamtmenge: wird im Feld eingetragen, Standard 1.
Restmenge: wird beim Spielen/Drehen berechnet.
```

## Entfernen nach Auslosung

```text
removeAfterWin
```

ist eine globale Preset-Einstellung, nicht pro Feld.

Wenn aktiv, wird das gezogene Gewinnfeld nach der Auslosung aus diesem Preset entfernt/deaktiviert.


## Bezug zu Giveaways

Seit LWG-4D existiert `backend/modules/loyalty_giveaways.js` als eigener Loyalty-Unterbereich. Wheel/Presets bleiben eigenständig und werden spaeter von Giveaways genutzt.


## LWG-4E Hinweis

Das Dashboard enthaelt jetzt zusaetzlich den Tab `Giveaways`. Tickets und Gewinnerziehung sind noch nicht umgesetzt.
