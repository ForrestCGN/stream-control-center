# STEP330 – Sound Dashboard UI/Control Stabilisierung

Stand: 2026-05-24

## Ziel

Das Sound-Dashboard wurde nach STEP320 optisch stabilisiert. Der Fokus lag auf UI-/Layout-Problemen, nicht auf Backend- oder Sound-Logik.

## Änderungen

- Medien-/Preview-Bleed-Guard im Sound-Dashboard ergänzt.
- Versteckte Sound-Sections werden härter ausgeblendet, inklusive Kinder-Elementen.
- Bilder, Videos, Canvas und Iframes im Sound-Modul werden auf die Modulbreite begrenzt.
- Sound-Liste bekommt eine maximale Höhe und internes Scrolling.
- Sound Control Center wurde übersichtlicher gruppiert:
  - Status
  - Playback
  - Gefahrzone
- Stop/Skip/Clear werden deaktiviert, wenn kein aktueller Sound bzw. keine Queue vorhanden ist.
- Gefahrzone wurde visuell getrennt.
- Queue-/Dateipfade werden besser abgeschnitten statt das Layout zu sprengen.

## Nicht geändert

- Keine Backend-Logik.
- Keine Sound-Queue-Logik.
- Keine Bundle-/activeBundleLock-Logik.
- Keine SoundBus-Event-Logik.
- Keine Alert-/Discord-/TTS-/VIP-Module.
- Keine DB-Migration.

## Test

Syntaxcheck:

```cmd
node --check htdocs/dashboard/modules/sound.js
```

Erwartung im Dashboard:

- Keine überlaufenden Medien-/Preview-Streifen im Sound-Dashboard.
- Control Center ist sauber gruppiert.
- Status/Playback/Gefahrzone sind optisch unterscheidbar.
- Stop/Skip sind deaktiviert, wenn kein aktueller Sound läuft.
- Queue leeren ist deaktiviert, wenn die Queue leer ist.
- SoundBus/Queue/Bundle bleiben unverändert stabil.
