# Changelog – Loyalty-Giveaways / Glücksrad

## 2026-06-19 – LWG Wheel Copy + Runtime Tests

### Added

- Test-/Diagnose-Dokumentation für Giveaway-bound Wheel Flow.
- Handoff für nächsten Chat: `CURRENT_CHAT_HANDOFF_LWG_WHEEL_OVERLAY_RUNTIME_1.md`.
- Overlay-Runtime-Ziel für Wheel-Overlay dokumentiert.

### Changed

- Dashboard-Copy-Fix getestet: Kopierte Giveaways behalten ein eigenes gebundenes Wheel mit Feldern.
- Wheel-Overlay soll künftig initial unsichtbar sein und nur über Bus/WS eingeblendet werden.
- Feldtextlayout soll zweizeilig/kompakter werden.

### Tested

- Giveaway-Kopie startbereit mit 8 Feldern.
- Open/Entry/Close/Draw.
- Wheel-Permission.
- Wheel-Claim.
- Spin-Ergebnis `Roadside Research`.
- Winner-Status `wheel_completed`.
- Permission-Status `used`.
- Bound-Wheel-Feld `quantityRemaining` wurde reduziert.

### Known Issues

- Ausschlussliste war im Test nicht aktiv, weil der Platzhalter-Dateiname genutzt wurde.
- Exclusion muss dauerhaft ins Dashboard/Backend.
- Wheel-Overlay-Textlayout muss nach Runtime-Fix erneut geprüft werden.
- `event_winner_overlay.html` war unerwartet sichtbar und muss separat geprüft werden.
