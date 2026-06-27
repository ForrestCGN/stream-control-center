# LWG-WHEEL-OVERLAY-RUNTIME-1

## Ziel

Das Loyalty-Glücksrad-Overlay wird runtime-tauglicher:

- Standardzustand unsichtbar/transparent.
- Einblendung per Bus/WS bei `loyalty.wheel.spin`.
- Ergebnis-Hold nach Spin und danach automatische Ausblendung.
- Sofortiges Ausblenden bei `loyalty.wheel.reset`.
- Zusätzliche manuelle Bus-Events vorbereitet:
  - `loyalty.wheel.overlay.show`
  - `loyalty.wheel.overlay.hide`
  - `overlay.loyalty.wheel.show`
  - `overlay.loyalty.wheel.hide`
- Feldtexte werden pro Segment in bis zu zwei Zeilen gebrochen und gekürzt, damit lange Steam-Key-Namen nicht mehr quer über das ganze Rad laufen.
- Winner-Banner unten begrenzt lange Texte auf maximal zwei Zeilen.

## Betroffene Datei

- `htdocs/overlays/loyalty/wheel_overlay.html`

## Einspielen

ZIP ab Repo-Root entpacken nach:

```powershell
D:\Git\stream-control-center
```

Danach:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "LWG-WHEEL-OVERLAY-RUNTIME-1 Overlay show-hide und Textlayout"
```

Backend-Neustart ist nicht nötig, weil nur das HTML-Overlay geändert wurde.
OBS-Browserquelle bzw. Browser-Seite danach neu laden/refreshen.

## Test

1. Overlay öffnen: `http://127.0.0.1:8080/overlays/loyalty/wheel_overlay.html`
2. Erwartung: zunächst nichts sichtbar.
3. Wheel-Claim oder Spin auslösen.
4. Erwartung: Overlay blendet ein, dreht, zeigt Ergebnis, blendet nach ca. 11 Sekunden aus.
5. Reset-Test: `POST /api/loyalty/games/wheel/reset` blendet sofort aus.

## Offene spätere Feinarbeit

- Genaues grafisches Textlayout pro Feld weiter optimieren.
- Optional Dashboard-Konfiguration für Hold-Zeit/Einblenddauer.
- Ausschlussliste für Giveaway-Gewinner ins Dashboard integrieren.
