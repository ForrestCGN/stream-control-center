# STEP200.4 – Sound-System Settings-Source-Anzeige

Stand: 2026-05-08  
Typ: kleiner Dashboard-STEP

## Ziel

Das Sound-Dashboard soll im Tab `Einstellungen` klarer anzeigen, aus welcher Quelle die Settings kommen:

- DB / `sound_settings`
- JSON-Fallback
- Default/Fallback

## Änderungen

- Settings-Quelle-Panel im Sound-Dashboard ergänzt.
- Quelle je Hauptblock sichtbar gemacht:
  - Ausgabe
  - Overlay
  - Queue
  - Prioritäten
  - Kategorie-Defaults
  - Defaults
- Hinweis ergänzt: DB-Werte gewinnen gegen JSON-Fallback.
- CSS für kompakte Source-Kacheln ergänzt.

## Nicht geändert

- keine Backend-Logik
- keine DB-Änderung
- keine JSON-Änderung
- keine Playback-/Queue-Logik
- keine Entfernung von `targets`
- keine Entfernung von `test_ping`
