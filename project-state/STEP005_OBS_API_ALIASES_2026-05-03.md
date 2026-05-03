# STEP005 - OBS API-Aliase ergänzt

Stand: 2026-05-03

## Ziel

OBS-Routen wurden vereinheitlicht, ohne bestehende Legacy-Routen zu entfernen.

Vorher:
- /obs/*

Zusätzlich nach STEP005:
- /api/obs/*

## Änderung

In backend/modules/obs.js wurde ein Helper ergänzt:

obsRoutes(legacyPath)

Dieser registriert Routen gleichzeitig unter:

- legacyPath
- /api + legacyPath

Beispiel:

- /obs/status
- /api/obs/status

## Wichtig

Es wurde keine bestehende /obs/* Route entfernt.
Die Handlerlogik wurde nicht geändert.
Nur die Express-Routenregistrierung wurde erweitert.

## Erfolgreich getestet

Legacy und neue API-Aliase:

- GET /obs/health
- GET /api/obs/health
- GET /obs/status
- GET /api/obs/status
- GET /obs/scenes
- GET /api/obs/scenes

Alle geprüften Routen antworten erfolgreich.

## Ergebnis

STEP005 erfolgreich abgeschlossen.

OBS bleibt rückwärtskompatibel und ist gleichzeitig besser an das einheitliche /api/* Schema angepasst.

## Nächster sinnvoller Schritt

Dashboard-OBS-Modul kann später schrittweise von /obs/* auf /api/obs/* umgestellt werden.

Dabei gilt:
- alte /obs/* Routen bleiben erhalten
- keine Funktionalität entfernen
- nach jeder Änderung Dashboard und Streamdesk testen

