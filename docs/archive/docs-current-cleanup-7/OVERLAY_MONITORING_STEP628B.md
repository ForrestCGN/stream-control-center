# Overlay Monitoring – STEP628B

STEP628B erweitert STEP628A um robuste Reparaturaktionen für verschachtelte OBS-Browserquellen.

## Warum

Quellen wie `_Sound-System` liegen oft nicht direkt in der Program-Szene, sondern in einer Unter-Szene wie `_Audio`. Sichtbarkeitsaktionen müssen deshalb auf dem SceneItem in der echten Parent-Scene ausgeführt werden.

## Ergebnis

- Inventar-Status erkennt aktive verschachtelte Quellen besser.
- Dashboard sendet `sceneItemId` an die Reparatur-API.
- Backend nutzt `sceneItemId`, wenn vorhanden.
- Buttons wurden umbenannt und verständlicher gemacht.

## Sicherheit

Alle Aktionen bleiben manuell. Es gibt keine automatische Reparatur.
