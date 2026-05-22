# CURRENT_SYSTEM_STATUS – Birthday Overlay 006B

Aktueller Overlay-Polish: `STEP_BIRTHDAY_006B`.

## Birthday-System

Funktionale Backend-/Command-/Sound-System-Logik bleibt unverändert zum letzten stabilen Backend-Stand.

## Overlay

`htdocs/overlays/_overlay-birthday.html` wurde für OBS 1920x1080 nachgeschärft:

- kompakteres CGN-Neon-Panel
- Avatar kleiner und sauberer links platziert
- Fallback-Initiale nur sichtbar, wenn kein Avatar vorhanden ist
- Name und Message ohne `@`
- bessere Textgrößen und Auto-Fit
- keine Änderung an Party-Phasen: Intro ruhig, Celebration erst ab `phase=party`

## Test-URL

```text
http://127.0.0.1:8080/overlays/_overlay-birthday.html
```
