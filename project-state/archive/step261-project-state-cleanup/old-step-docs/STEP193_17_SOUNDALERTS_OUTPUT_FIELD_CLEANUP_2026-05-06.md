# STEP193.17 - SoundAlerts Output Field Cleanup

Stand: 2026-05-06

## Ziel

Der Eintrag-Editor soll weniger fehleranfällig sein. Das Ausgabeziel wird nicht mehr pro Eintrag manuell über ein eigenes Feld gesetzt, sondern automatisch aus dem Typ und den globalen Audio-/Video-Zielen abgeleitet.

## Geändert

Betroffene Datei:

- `htdocs/dashboard/modules/soundalerts.js`

Änderungen:

- Feld `Ausgabe` aus dem Eintrag-Editor entfernt.
- Bei `Typ = Audio` wird automatisch das globale `Audio-Ziel` genutzt.
- Bei `Typ = Video` wird automatisch das globale `Video-Ziel` genutzt.
- Beim Speichern wird `outputTarget` aus dem aktuellen Medientyp berechnet.
- Beim Wechsel von Audio/Video wird die Ansicht aktualisiert und die automatische Ausgabezuordnung bleibt konsistent.

## Nicht geändert

- Keine Backend-Aenderung.
- Keine API-Aenderung.
- Keine DB-Schemaaenderung.
- Bestehende Test-/Overlay-Test-Funktion bleibt erhalten.

## Fachregel

```text
Audio -> globales Audio-Ziel
Video -> globales Video-Ziel
```

Ein einzelner SoundAlert soll sein Ausgabeziel nicht mehr unabhängig vom Typ im normalen Editor überschreiben. Sondertests laufen weiterhin über den Overlay-Test-Button.

## Test

```text
node --check htdocs/dashboard/modules/soundalerts.js
```

Manuell prüfen:

1. SoundAlerts > Einträge öffnen.
2. Eintrag bearbeiten.
3. Feld `Ausgabe` ist nicht mehr sichtbar.
4. Typ Audio/Video wechseln.
5. Speichern/Freigeben.
6. API prüfen: Audio nutzt Audio-Ziel, Video nutzt Video-Ziel.
