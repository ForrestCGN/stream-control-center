# CURRENT_STATUS Ergänzung – STEP200.2

Stand: 2026-05-08

## Sound-System

STEP200.1 ist abgeschlossen:

```text
/api/sound/routes              vorhanden
/api/sound/integration-check   vorhanden
integration-check healthy      true
```

STEP200.2 dokumentiert die Sound-System-Zielarchitektur:

```text
output.targets = aktiv
targets        = Legacy/Kompatibilität
sound_settings = DB-Zielquelle
sound_system.json = Seed/Fallback/Boot-Konfig
```

## Offene Sound-System-Punkte

- Sound-Dashboard prüfen
- Settings-Quelle sichtbar machen
- JSON/Seed-Bereinigung planen
- `target` vs `outputTarget` Aufrufer prüfen
