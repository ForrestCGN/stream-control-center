# STEP010 - OBS Dashboard nutzt /api/obs/* für Aktionen

Stand: 2026-05-03

## Ziel

Nach STEP005 und STEP006 wurden nun auch die schreibenden/auslösenden OBS-Dashboard-Aktionen auf das einheitliche /api/obs/* Schema umgestellt.

## Änderung

In htdocs/dashboard/modules/obs.js wurden geändert:

- /obs/scene/switch -> /api/obs/scene/switch
- /obs/replay/save -> /api/obs/replay/save

## Voraussetzungen

STEP005 hatte Backend-Aliase ergänzt:

- /obs/*
- /api/obs/*

Die alten /obs/* Routen bleiben weiterhin vorhanden.

## Wichtig

- Keine Backend-Logik geändert.
- Keine Funktionalität entfernt.
- Alte /obs/* Routen bleiben rückwärtskompatibel.
- Dashboard nutzt jetzt für OBS-Lesen und OBS-Aktionen /api/obs/*.

## Tests

Geprüft:

- node -c htdocs/dashboard/modules/obs.js
- Suche nach alten Dashboard-POST-Routen
- Suche nach Mojibake-Mustern
- Live-Datei nach Deploy geprüft
- GET /api/obs/status geprüft

Ergebnis:

- /api/obs/scene/switch ist im Dashboard eingetragen.
- /api/obs/replay/save ist im Dashboard eingetragen.
- Alte Dashboard-Aufrufe /obs/scene/switch und /obs/replay/save sind entfernt.
- Keine Encoding-/Mojibake-Treffer.
- OBS-API antwortet sauber.

## Ergebnis

STEP010 erfolgreich abgeschlossen.

OBS-Dashboard ist jetzt vollständig auf /api/obs/* umgestellt, während Legacy /obs/* weiter existiert.
