# STEP006 - OBS Dashboard nutzt /api/obs/* für Leserouten

Stand: 2026-05-03

## Ziel

Das OBS-Dashboard-Frontend wurde schrittweise an das einheitliche /api/* Schema angepasst.

## Änderung

In htdocs/dashboard/modules/obs.js wurden nur sichere Leserouten umgestellt:

- /obs/dashboard/config -> /api/obs/dashboard/config
- /obs/status -> /api/obs/status
- /obs/scenes -> /api/obs/scenes
- /obs/replay/status -> /api/obs/replay/status
- /obs/audio/state -> /api/obs/audio/state
- /obs/stats -> /api/obs/stats
- /obs/browser-sources -> /api/obs/browser-sources
- /obs/sources -> /api/obs/sources

## Bewusst nicht geändert

Schreibende/auslösende Aktionen bleiben vorerst auf Legacy-Routen:

- /obs/scene/switch
- /obs/replay/save

Grund: Kleine, risikoarme Schritte. Aktionen werden erst nach separatem STEP umgestellt.

## Voraussetzungen

STEP005 hatte zuvor im Backend Aliase ergänzt:

- /obs/*
- /api/obs/*

Die alten /obs/* Routen bleiben erhalten.

## Tests nach Deploy

Erfolgreich geprüft:

- GET /api/obs/status
- GET /api/obs/scenes
- GET /api/obs/replay/status
- GET /api/obs/audio/state

Ergebnis:

- /api/obs/status antwortet ok
- /api/obs/scenes antwortet ok
- /api/obs/replay/status antwortet ok
- /api/obs/audio/state antwortet IDLE

## Ergebnis

STEP006 erfolgreich abgeschlossen.

Das OBS-Dashboard nutzt für Status-/Lesedaten jetzt /api/obs/*.
Bestehende Legacy-Routen bleiben weiter vorhanden.
Keine Funktionalität entfernt.

## Nächster sinnvoller Schritt

STEP007 kann entweder:

1. OBS-Dashboard POST-Aktionen ebenfalls auf /api/obs/* umstellen, oder
2. Fireworks-Doppelroute prüfen und zentralisieren, oder
3. Dashboard-Encoding/Mojibake in sound.js/adminconfigs.js beheben.

Empfehlung: Als nächstes Dashboard-Encoding beheben, weil sichtbare UI-Texte betroffen sind.

