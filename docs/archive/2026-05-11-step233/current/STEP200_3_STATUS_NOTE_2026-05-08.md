# STEP200.3 Status-Notiz – Sound-Dashboard Diagnose

Stand: 2026-05-08

## Kurzfassung

Das Sound-Dashboard nutzt jetzt die neuen Standard-Endpunkte:

```text
GET /api/sound/routes
GET /api/sound/integration-check
```

Dafür wurde ein neuer Tab `Diagnose` ergänzt.

## Dashboard-Anzeige

Die Diagnose zeigt:

- Integrationsstatus
- Overlay-Client
- DB-Settings
- JSON-Fallback
- AudioDeviceHelper
- Sound-Ordner
- MP4/WebM-Unterstützung
- Routenanzahl
- Warnungen/Fehler

## Architekturhinweis

Im Dashboard wird sichtbar festgehalten:

```text
output.targets = aktives Ausgabezielmodell
targets = Legacy/Kompatibilität
```

## Nicht geändert

Keine Backend-, DB-, JSON- oder Playback-Änderungen.
