# CAN44.32 AutoShoutout StreamDay Reliability Status

Stand: vorbereitet

## Betroffene Datei
- backend/modules/clip_shoutout.js

## Ziel
AutoShoutout soll keinen alten StreamDay über Folgetage hinweg weiterverwenden. Blockgründe sollen künftig besser sichtbar werden.

## Testpflicht
- node -c backend/modules/clip_shoutout.js
- StepDone ausführen
- Live-System prüfen: /api/clip-shoutout/status
- storeSkippedEvents aktivieren, falls DB-Wert false ist
