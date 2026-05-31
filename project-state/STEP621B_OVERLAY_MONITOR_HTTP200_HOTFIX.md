# STEP621B - Overlay-Monitor HTTP-200 Hotfix

## Ziel
Der Overlay-Monitor durfte optionale API-Antworten mit `ok:false` und HTTP 200 nicht mehr als harten Ladefehler behandeln.

## Problem
Das Dashboard nutzte `window.CGN.api()`. Diese zentrale Dashboard-API wirft einen Fehler, wenn eine Antwort zwar HTTP 200 liefert, aber im JSON `ok:false` steht. Dadurch erschien im Overlay-Monitor nur `HTTP 200`, obwohl die Route technisch erreichbar war.

Typischer Auslöser:
- `/api/overlay-monitor/status` kann bei erkannten Problemen `ok:false` liefern.
- `/api/obs/status` kann bei nicht verbundenem OBS `ok:false` liefern.

Beides ist für den Overlay-Monitor Diagnosezustand, kein Grund die ganze Seite abzubrechen.

## Änderung
Betroffene Datei:
- `htdocs/dashboard/modules/overlays.js`

Änderung:
- Modulinterner API-Wrapper nutzt direkt `fetch`.
- Nur echte HTTP-Fehler werfen noch Exceptions.
- JSON `ok:false` wird als gültiger Diagnosezustand übernommen.
- OBS offline/unbekannt bleibt Anzeigezustand, kein Seitenfehler.

## Nicht geändert
- Keine Backend-Änderung
- Keine DB-Migration
- Keine OBS-Aktion
- Keine Reparaturbuttons
- Keine Automatik

## Test
```powershell
node --check htdocs\dashboard\modules\overlays.js
```
