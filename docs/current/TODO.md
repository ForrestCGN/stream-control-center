# Current TODO

Stand: nach STEP278

## Sofort

- STEP278 Doku-Paket einspielen und committen, falls noch nicht erledigt.
- Prüfen, dass `/api/_status` weiterhin sauber ist:
  - alle Runtime-Module mit `hasModuleMeta=true`
  - alle Runtime-Module mit `type=runtime`
  - `duplicateRoutes=[]`
  - nur `obs_shared.js` skipped

## Als Nächstes

### STEP279 – Heartbeat-Standard

Planen, nicht blind einbauen.

Aufgaben:

1. Heartbeat-Datenmodell festlegen
2. Communication Bus als Registry planen
3. Status-Endpunkte entwerfen
4. Pilotmodule auswählen
5. Dashboard-Anzeige vorbereiten
6. Erst danach Implementierung als eigener STEP

## Pilotmodule für Heartbeat

- `sound_system.js`
- `alert_system.js`
- `obs.js`

## Danach

- Modulstatus im Dashboard sichtbar machen
- Route-Diagnose im Dashboard sichtbar machen
- Health-/Heartbeat-Events standardisieren
- EventBus langfristig als Überwachungs- und Kommunikationssystem ausbauen

## Merksatz

STEP278 hat die Modul-Diagnose sauber gemacht.
STEP279 soll daraus eine echte, dashboardfähige Heartbeat-/Health-Überwachung machen.

