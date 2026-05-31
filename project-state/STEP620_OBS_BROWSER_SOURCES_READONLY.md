# STEP620 – OBS-Browserquellen read-only im Overlay-Monitor

## Ziel

Der bestehende Bereich `Control → Overlays` zeigt zusätzlich zum Bus-Overlay-Status jetzt auch den OBS-Status und die von OBS gemeldeten Browserquellen an.

## Geänderte Dateien

- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

## Datenquellen

- `GET /api/overlay-monitor/status?events=10`
- `GET /api/obs/status`
- `GET /api/obs/browser-sources`

## Verhalten

- Overlay-Bus-Clients werden weiterhin read-only angezeigt.
- OBS-Status wird separat angezeigt.
- OBS-Browserquellen werden separat angezeigt.
- Wenn OBS offline ist, aber Bus-Clients online melden, zeigt das Dashboard eine Warnung.
- Es wird ausdrücklich noch keine feste Zuordnung zwischen Bus-Client und OBS-Quelle vorgenommen.

## Nicht enthalten

- keine OBS-Aktionen
- kein Ein-/Ausblenden
- kein Browser-Cache-Refresh
- keine Automatik
- keine Reparatur
- keine DB-Migration
- keine Mapping-Tabelle
- keine Backend-Änderung

## Nächster sinnvoller Schritt

STEP621 sollte das DB-basierte Mapping vorbereiten:

- Overlay-System / Anzeigename
- OBS Scene
- OBS Source
- Bus Client ID
- erwartet sichtbar ja/nein
- manuelle Aktionen erlaubt ja/nein
- Auto-Monitoring später ja/nein
