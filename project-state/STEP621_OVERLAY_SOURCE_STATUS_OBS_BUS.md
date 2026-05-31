# STEP621 – Overlay-Quellenstatus: OBS + Bus zusammen bewerten

## Ziel

Die Overlay-Seite soll nicht nur technische Bus-Clients zeigen, sondern pro OBS-Browserquelle schnell beantworten:

- Ist die Quelle in OBS vorhanden?
- Ist sie in einer Szene eingebunden?
- Ist sie aktuell sichtbar?
- Gibt es einen passenden Bus-Client?
- Wirkt die Quelle bereit, wartet sie, oder gibt es eine Warnung/einen Fehler?

## Geänderte Dateien

- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

## Verhalten

- Neuer Tab `Quellenstatus`.
- OBS-Browserquellen werden mit OBS-Szenen/Szenelementen zusammengeführt.
- Sichtbarkeit wird aus `GET /api/obs/scene-items?scene=...` gelesen.
- Bus-Clients werden heuristisch anhand Quellenname/URL/Dateiname/Modulname zugeordnet.
- Bewertungen:
  - `Sichtbar + verbunden`
  - `Ausgeblendet / wartet`
  - `Ausgeblendet, Bus aktiv`
  - `Sichtbar, kein Bus-Client`
  - `Sichtbar, Heartbeat stale`
  - `OBS offline/unbekannt`

## Bewusst nicht enthalten

- keine Reparaturbuttons
- kein Cache-Refresh
- kein Ein-/Ausblenden
- keine DB-Mapping-Tabelle
- keine Automatik
- keine Backend-Änderung

## Hinweise

Die Zuordnung OBS-Quelle ↔ Bus-Client ist in diesem Step bewusst nur heuristisch. Für eine spätere produktive Reparatur und saubere Bewertung ist eine feste Mapping-Tabelle sinnvoll.
