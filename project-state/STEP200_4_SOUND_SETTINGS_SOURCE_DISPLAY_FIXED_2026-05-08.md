# STEP200.4 – Sound-System Settings-Quelle anzeigen (Fix)

Stand: 2026-05-08  
Projekt: stream-control-center  
Status: vorbereitet

## Hintergrund

Der erste STEP200.4-Stand wurde auf einer falschen/alten `sound.js`-Basis gebaut und wurde danach per Git-Revert zurückgenommen.

Dieser Fix-Stand basiert auf der aktuellen Sound-Dashboard-Datei nach STEP200.3/Revert und erhält die Diagnose-Funktion vollständig.

## Änderung

Im Sound-Dashboard unter `Einstellungen` wird ein neues Panel `Settings-Quelle` angezeigt.

Es zeigt:

- verwendete Settings-Tabelle (`sound_settings`)
- Anzahl erkannter DB-Settings-Blöcke
- JSON-Fallback-Status
- aktive Regel `database_over_json_fallback_for_allowed_blocks`
- Status für wichtige Blöcke:
  - Ausgabe
  - Overlay
  - Queue
  - Prioritäten
  - Kategorie-Defaults
  - Defaults

## Nicht geändert

- keine Backend-Logik
- keine DB
- keine JSON-Dateien
- keine Playback-/Queue-Logik
- keine Entfernung von Legacy `targets`
- keine Entfernung von `test_ping`
- Diagnose-Tab bleibt erhalten

## Test

Vor Commit:

```powershell
cd D:\Git\stream-control-center
node --check htdocs\dashboard\modules\sound.js
```

Nach Deploy im Dashboard prüfen:

```text
Sound-System -> Einstellungen
Sound-System -> Diagnose
```

Erwartung:

- Dashboard lädt ohne `integrationCheck is not defined`
- Einstellungen zeigen `Settings-Quelle`
- Diagnose bleibt sichtbar und gesund
