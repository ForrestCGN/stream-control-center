# TODO – Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Aktueller Step

- [x] `LWG_BOUND_WHEEL_FIELD_COUNT_1` als Datei-/ZIP-Stand vorbereitet.
- [x] Giveaway-bound Wheel füllt nicht mehr visuell auf 12 Felder auf.
- [x] Bound-Wheel-Spin nutzt bei 2+ verfügbaren Gewinnen exakt die verfügbaren Felder.
- [x] Single-Remaining-Regel im Backend vorbereitet: 1 verbleibender Gewinn wird direkt vergeben.
- [x] 0 verfügbare Gewinne werden backendseitig blockiert.
- [x] Syntax-Check für geänderte JS-Dateien erfolgreich.

## Vor Live-Deploy

- [ ] Sicherheitskopie der aktuell laufenden Dateien erstellen:
  - `backend/modules/loyalty_giveaways.js`
  - `backend/modules/loyalty_games.js`
  - `backend/modules/loyalty_games/wheel.js`
  - `config/loyalty_games.json`
  - `htdocs/overlays/loyalty/wheel_overlay.html`
- [ ] ZIP nach Repo-/Live-Struktur einspielen.
- [ ] StepDone nach dem Einspielen/Deployen ausführen.
- [ ] Danach erst testen.

## Direkt nach Deploy testen

- [ ] `loyalty_giveaways` Status grün, Version `0.1.13`, Build `LWG_BOUND_WHEEL_FIELD_COUNT_1`.
- [ ] `loyalty_games` Status grün, Version `0.2.8`, Build `LWG_BOUND_WHEEL_FIELD_COUNT_1`.
- [ ] Bound-Wheel mit 2+ verfügbaren Feldern startet normalen Spin.
- [ ] Spin-Metadata prüfen: `fieldsCount` und `visualFieldsCount` müssen bei Giveaway-bound Wheels identisch sein.
- [ ] Bound-Wheel mit 1 verfügbarem Feld vergibt direkt, ohne normalen Spin/Overlay-Dreh.
- [ ] Bound-Wheel mit 0 verfügbaren Feldern blockiert Claim/Spin sauber.

## Später wieder anfassen – Dashboard-Config

Diese Runtime-Regel ist heute bewusst fest eingebaut, damit der Stream funktioniert.

Später muss das als streamerfreundliche Dashboard-Konfiguration umgesetzt werden:

- [ ] Verhalten bei 1 verbleibendem Gewinn konfigurierbar machen:
  - Direktvergabe,
  - separates Letzter-Gewinn-Overlay,
  - optional normaler Spin trotz 1 Feld.
- [ ] Verhalten bei 0 verfügbaren Gewinnen im Dashboard sichtbar machen.
- [ ] Exakte Feldanzahl vs. Mindestfeldanzahl getrennt konfigurieren:
  - Giveaway-bound Wheels: Standard exakt verfügbare Felder.
  - Standalone-/Preset-Wheels: `minVisibleSlots` weiter möglich.
- [ ] Späteres Letzter-Gewinn-Overlay planen, aber nicht heute erzwingen.

## Weitere offene Punkte

- [ ] Direkten Reset-/Hide-Test sauber möglich machen.
- [ ] Ausschlussliste/Exclusions dashboardfähig integrieren.
- [ ] Test-Giveaway nach Abschluss löschen oder eindeutig als Test markieren.
- [ ] Gamble-Alias-Bug separat prüfen: `aliases` zeigt `[object`, `object]`.
