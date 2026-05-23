# NEXT_STEPS

## Direkt nach STEP276I

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Ausführen:

```cmd
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP276I alert mediaId docs sync"
```

3. Kein Backend-Neustart zwingend nötig, da nur Dokumentation geändert wird.

## Danach sinnvoll

### Option A: STEP276 abschließen

Wenn die Tests passen:
- STEP276 als abgeschlossen betrachten.
- Keine weiteren Mini-Fixes am aktuellen Medien-Layout, außer echte Fehler.

### Option B: STEP277 vorbereiten

Empfohlener nächster Block:

- Alert-Dashboard-Medienbereiche strukturell neu planen.
- Keine schnelle Flickarbeit mehr an engen Kacheln.
- Besserer Aufbau:
  - Sound
  - Regel-Grafik
  - Design-Grafik
  - Fallbacks / Legacy

### Option C: Media-Registry Qualität

Später sinnvoll:
- Media-Analyse/Refresh-Button für einzelne Medien.
- Medien-Metadaten prüfen/neu berechnen.
- Upload- und Picker-UX verbessern.

## Bekannte offene Punkte

- Dashboard-Medienlayout ist funktional, aber nicht final schön.
- Fallback-Bereiche bleiben erhalten, sollen später im Redesign klarer integriert werden.
- Legacy-Alert-Assets dürfen noch nicht entfernt werden.
