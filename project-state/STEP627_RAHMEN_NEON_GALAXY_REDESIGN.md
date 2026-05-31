# STEP627 – Rahmen Overlay Neon-Galaxy-v2 Redesign

## Ziel

Das bestehende Rahmen-Overlay `_rahmen.html` wurde visuell auf den aktuellen ForrestCGN-/Neon-Galaxy-v2-Stil gebracht.

## Geänderte Datei

- `htdocs/overlays/_rahmen.html`

## Inhalt

- transparenter OBS-Hintergrund bleibt erhalten
- feste bisherige Rahmengröße bleibt erhalten: 778 × 436 px
- moderner Neon-Lila/Cyan-Rahmen
- dezenter Glass-/Glow-Look
- zwei CGN-typische Lichtpunkte oben links und unten rechts
- ruhiger umlaufender Runner-Effekt
- Bus-/Heartbeat-Anbindung bleibt erhalten
- Client bleibt `overlay:frame_overlay`
- Version des Overlay-Clients: `0.2.0`

## Nicht geändert

- keine OBS-Quellen umbenannt
- keine OBS-Aktionen ergänzt
- keine Backend-Änderung
- keine Dashboard-Änderung
- keine Reparaturbuttons
- keine Funktionalität entfernt

## Test

Nach dem Einspielen:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP627 Rahmen Overlay Neon Galaxy Redesign"
```

Danach in OBS die Browserquelle `Rahmen` aktualisieren oder OBS neu starten.

Im Dashboard sollte weiterhin gelten:

- `Rahmen Overlay`
- Bus: `overlay:frame_overlay`
- Heartbeat: OK
- OBS sichtbar je nach Szene
