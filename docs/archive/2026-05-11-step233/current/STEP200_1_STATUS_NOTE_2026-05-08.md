# STEP200.1 Status-Notiz – Sound-System Standardisierung

Stand: 2026-05-08

## Kurzfassung

Das Sound-System bekommt die fehlenden Standard-Endpunkte:

```text
GET /api/sound/routes
GET /api/sound/integration-check
```

Damit ist es besser an den neuen globalen Modulstandard angepasst.

## Wichtige Architekturentscheidung

Aktuell existieren zwei Zielsysteme:

```text
output.targets = overlay/device/both
targets        = stream/discord/both
```

`output.targets` ist das aktive technische Ausgabezielmodell.  
`targets` bleibt als Legacy-/Kompatibilitätsstruktur erhalten.

Keine Funktionalität wurde entfernt.

## Nächster Punkt nach STEP200.1

Nach erfolgreichem Test kann das Dashboard später verbessert werden:

- Settings-Quelle anzeigen
- Legacy-Targets verständlich markieren
- Sound-System Settings weiter DB-orientiert darstellen
- JSON-Presets langfristig als Seed/Fallback dokumentieren
