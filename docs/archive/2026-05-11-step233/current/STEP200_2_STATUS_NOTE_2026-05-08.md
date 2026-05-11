# STEP200.2 Status-Notiz – Sound-System Standardisierung

Stand: 2026-05-08

## Kurzfassung

Sound-System ist nach STEP200.1 funktional grün und besitzt jetzt:

```text
/api/sound/routes
/api/sound/integration-check
```

Der Integration-Check ist gesund. Die Warnung `legacy_targets_and_output_targets_both_present` ist aktuell erwartet.

## Architekturentscheidung

```text
output.targets = aktives Ausgabezielmodell
targets        = Legacy/Kompatibilität
```

Aktives Modell:

```text
output.targets.overlay
output.targets.device
output.targets.both
```

Legacy-Modell:

```text
targets.stream
targets.discord
targets.both
```

Legacy darf noch nicht entfernt werden, bis alle Aufrufer geprüft sind.

## DB-/JSON-Regel

```text
sound_settings = Zielquelle für dashboardfähige Sound-Settings
sound_system.json = Seed/Fallback/technische Boot-Konfiguration
```

`test_ping` im JSON bleibt vorerst erhalten, soll aber später als Seed/Fallback oder DB-Preset sauber eingeordnet werden.

## Nächste Kandidaten

- STEP200.3 Sound-System Dashboard prüfen
- STEP200.4 Settings-Source-Anzeige planen
- STEP200.5 JSON/Seed-Bereinigung planen
- STEP200.6 Aufruferprüfung target vs outputTarget
