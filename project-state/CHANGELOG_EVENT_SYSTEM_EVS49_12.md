# CHANGELOG_EVENT_SYSTEM_EVS49_12

Stand: 2026-06-18

## EVS43
- RuntimeGate Stream-State Fix.
- `stream_events` nutzt `twitch_events.getStreamState()`.
- Manual Override Online wird korrekt berücksichtigt.
- Chat-Evaluation aktiv bei Online Override.

## EVS44
- Stream Offline Auto-Wait + Button Guard.
- Kein klebender manueller Pausemodus mehr.
- Bei Offline `stream_offline_waiting`.
- Bei Online automatische Rückkehr zu `waiting`.
- „Wartezeit überspringen“ nur bei aktiv/waiting/online sichtbar.

## EVS49.0–EVS49.11
- Winner-Finale-Overlay stark iteriert.
- Alter Card-Look verworfen, weil nicht CGN genug.
- KI-Hintergrundbild-Ansatz verworfen, weil 1920×1080 nicht zuverlässig.
- Raster-PNG-Hintergrund als Basis gewählt.
- Mehrere Mapping-/Raster-/Boxen-Versionen gebaut.
- Pixelraster und Feinraster eingeführt.
- Erkenntnis: Einzelne Textpositionen frei zu schieben ist nicht robust.
- Neuer Ansatz: komplette Slot-Schablonen/Kacheln als HTML/CSS über die Grafik legen.

## EVS49.12
- Slot-Template-Layout begonnen.
- Ziel: komplette Schablonen statt Einzeltextpositionen.
- Problem: Test mit `debug=boxes&grid=1&v=4912` zeigt schwarz.
- EVS49.12 ist daher nicht stabil/final.
