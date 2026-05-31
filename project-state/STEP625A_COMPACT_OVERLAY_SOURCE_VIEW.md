# STEP625A – Kompakter Overlay-Quellenstatus

## Ziel

Der Quellenstatus im Overlay-Monitor wurde kompakter aufgebaut, damit auf den ersten Blick sichtbar ist:

- welche Quelle betroffen ist,
- ob sie in OBS effektiv sichtbar ist,
- ob ein Bus-Client/Heartbeat vorhanden ist,
- ob es sich um eine externe Quelle handelt.

Die langen Detailblöcke wurden in einen einklappbaren Detailbereich verschoben.

## Geändert

- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

## Nicht geändert

- keine OBS-Aktionen
- kein Cache-Refresh
- keine Reparaturbuttons
- keine DB-Migration
- kein Backend-Code
- keine Änderung am EventBus

## Hinweise

Der nächste Backend-Schritt kann das Monitoring-Issue-Lifecycle-Log umsetzen:

- neue Warnung einmal speichern,
- bestehende Warnung nur aktualisieren,
- bei Behebung einmal `resolved` speichern.

