# STEP200.4 Status-Notiz – Sound-System Settings-Source-Anzeige

Stand: 2026-05-08

## Kurzfassung

Das Sound-Dashboard zeigt im Tab `Einstellungen` nun kompakt die Settings-Quelle der wichtigsten Blöcke an.

Ziel bleibt:

```text
DB gewinnt gegen JSON-Fallback.
JSON bleibt Seed/Fallback/technische Boot-Konfiguration.
```

## Betroffene Dateien

```text
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
```

## Test

Nach Deploy prüfen:

```text
Dashboard → Sound-System → Einstellungen
```

Erwartung:

- neues Panel `Settings-Quelle`
- DB-Tabelle `sound_settings`
- Kacheln für Ausgabe/Overlay/Queue/Prioritäten/Kategorie-Defaults/Defaults
- Diagnose-Tab aus STEP200.3 bleibt vorhanden
