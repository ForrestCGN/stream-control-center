# Changelog – Loyalty-Giveaways / CGN-Glücksrad

## 2026-06-19 – LWG Wheel Overlay Runtime + Radial Text Regression

### Added

- Dokumentation für bestätigten Overlay-/Regression-Stand `LWG-WHEEL-TEXT-RADIAL-5`.
- Entscheidung zur Feldanzahl-Regel für Giveaway-bound Wheels dokumentiert.
- Entscheidung zur letzten Gewinnregel dokumentiert:
  - 2+ Gewinne → Spin.
  - 1 Gewinn → Direktvergabe / separates Letzter-Gewinn-Overlay.
  - 0 Gewinne → blockieren.

### Changed

- Wheel-Overlay mehrfach verbessert bis `LWG-WHEEL-TEXT-RADIAL-5`:
  - Initial unsichtbar.
  - Einblenden bei Spin.
  - Auto-Hide nach Ergebnis.
  - Winner-/Finale-Overlay isoliert.
  - Statuspanel links entfernt.
  - Segmenttexte radial mit Segmentrichtung.
  - `€`-Darstellung korrigiert.
  - Gewinnerbanner ohne Subtext.
  - Gewinnerbanner für lange Namen verkleinert.

### Tested

- `loyalty_giveaways` Status: ok/enabled/kein lastError.
- `loyalty_games` Status: ok/enabled/kein lastError.
- Bound-Wheel-Felder: 8 Felder vorhanden.
- Ein Feld (`Roadside Research`) ist nach echtem Test gewonnen und hat `quantityRemaining=0`.
- Regression-Spin mit echten Bound-Wheel-Feldern gestartet.
- Letzter Regression-Spin: `Valheim`.
- Wheel nach Spin: `running=false`, `activeSession=null`, `lastError=`.
- Winner-/Finale-Overlay blieb beim Wheel aus.

### Known Issues / Follow-up

- Giveaway-bound Wheel füllt optisch noch auf 12 sichtbare Felder auf (`visualFieldsCount=12`), obwohl fachlich nur verfügbare Felder gezogen werden (`fieldsCount=7`).
- Für Giveaway-bound Wheels soll nicht auf 12 aufgefüllt werden.
- Direkte REST-Test-Route `/api/communication-bus/publish` existiert nicht; Reset-/Hide-Test braucht echte Route oder Diagnosefunktion.
- `!gamble` Alias-Bug: Status zeigt `aliases: ["[object", "object]"]`.
- Ausschlussliste/Exclusions noch dashboardfähig umzusetzen.
- Test-Giveaway später löschen oder eindeutig als Test markieren.
