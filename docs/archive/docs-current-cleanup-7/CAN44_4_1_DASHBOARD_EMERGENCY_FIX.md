# CAN-44.4.1 Dashboard Emergency Fix

## Zweck

Dieser Hotfix entfernt die fehlerhafte Auto-Shoutout-DOM-Integration aus dem Dashboard-Start.

## Hintergrund

CAN-44.4 hat Auto-Shoutout per separatem Script und MutationObserver nachtraeglich in das Shoutout-System injiziert. Dadurch konnte das Dashboard in eine Render-/Observer-Schleife geraten, Tabs waren nicht mehr anklickbar und der Browser hing.

## Geaendert

- `htdocs/dashboard/index.html` laedt `auto_shoutout.js` nicht mehr automatisch.
- `auto_shoutout.css` wird nicht mehr automatisch geladen.
- Backend/DB/Auto-SO-Funktionalitaet bleibt unveraendert.
- Shoutout-System und Dashboard-Tabs werden wieder benutzbar.

## Naechster Schritt

Auto-Shoutout wird danach sauber direkt in `htdocs/dashboard/modules/shoutout.js` als echter Tab integriert, ohne MutationObserver/DOM-Hack.
