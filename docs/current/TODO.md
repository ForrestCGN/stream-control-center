# Current TODO

Stand: 2026-06-04

## Sofort

- CAN-44.19.3 ZIP einspielen, falls noch nicht erledigt.
- `node -c htdocs\dashboard\modules\shoutout_texts.js` prüfen.
- `stepdone.cmd "CAN-44.19.3 Shoutout Text Dropdown Polish"` ausführen.
- Danach dieses Doku-/Handoff-Paket CAN-44.19.4 einspielen und committen.

## Shoutout-System

### Erledigt

- Gemeinsamer Texte-Tab im Shoutout-System.
- Dropdown-Layout für Kategorie und Text-Key.
- Varianten-Editor im Dashboard.
- Backend-Routen:
  - `GET /api/clip-shoutout/texts`
  - `POST /api/clip-shoutout/texts`
  - `GET /api/clip-shoutout/texts/migration`
- Textdaten in `module_text_variants`.
- Migration/Kompatibilität als DryRun sichtbar.
- Keine Runtime-Umstellung.
- Legacy/Fallback bleibt erhalten.

### Offen

- Dashboard gesamt neu organisieren.
- AutoShoutout nicht mehr wie angeflanscht wirken lassen.
- Chat-Shoutout als klaren Bereich einführen.
- Produktion/Live-Test/Diagnose zusammenführen.
- Einstellungen sauber trennen.
- Runtime später auf `shoutout.*` Textkeys umstellen.
- Texte inhaltlich nochmal überarbeiten.

## Nächster STEP

```text
CAN-44.20 – Shoutout Dashboard Reorganisation
```

## Spätere Idee

Die rechte Navigation könnte später in eine obere, immer sichtbare Leiste wandern, damit darunter mehr Arbeitsfläche entsteht. Dies ist ein größerer Dashboard-/Shell-Umbau und nicht Teil des nächsten kleinen Shoutout-Steps, sollte aber im Hinterkopf bleiben.

## Weiterhin verbindlich

- Keine Funktionalität entfernen.
- Bestehende DB nicht ersetzen.
- Bestehende Helper nutzen.
- Config/Text/DB Standards einhalten.
- Änderungen in kleinen CAN-Steps.
- Nach größeren Schritten Doku aktualisieren.
