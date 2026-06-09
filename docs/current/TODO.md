# TODO – Loyalty Giveaways / Glücksrad

Aktualisiert: 2026-06-09 09:08:00 UTC

## Erledigt / bestätigt

- [x] LWG-4M.5 Backend-Code eingespielt und aktiv (`STEP_LWG_4M_5`).
- [x] LWG-4M.6 Dashboard-Fix bestätigt: Wheel-Preset-Feld bei Classic-Modi nicht mehr nutzbar sichtbar.
- [x] LWG-4M.7 Runtime-Test erfolgreich durchgeführt.
- [x] Draw aus `open` wird korrekt blockiert.
- [x] Close setzt `closed_for_entries`.
- [x] Bound-Wheel wird beim Öffnen `active` und `locked=true`.
- [x] Draw erstellt Wheel-Permission mit Bound-Wheel-Metadata.
- [x] Claim/Spin setzt Permission auf `used` und Giveaway auf `finished`.

## Aktuell offen

### LWG-4M.9 – UI-Safety für neues Giveaway-Rad
- [ ] Option `Neues Rad für dieses Giveaway` deaktivieren oder ausblenden, solange kein Bound-Wheel-Field-Editor existiert.
- [ ] Hinweistext ergänzen: `Eigene Giveaway-Räder folgen später. Bitte aktuell eine Vorlage kopieren.`
- [ ] Payload-Sicherheit beibehalten: Wheel-Giveaways ohne `sourcePresetUid` nicht als praktisch nutzbar behandeln.

### LWG-4N.0 – echter Bound-Wheel-Field-Snapshot / Editor
- [ ] Entscheiden: eigene Bound-Wheel-Field-Tabelle oder Snapshot über linked preset.
- [ ] Felder beim Kopieren einer Vorlage wirklich in Giveaway-Kontext duplizieren.
- [ ] Dashboard-Editor `Rad bearbeiten` im Giveaway-Kontext bauen.
- [ ] Änderungen globaler Presets dürfen aktive Giveaway-Wheels nicht nachträglich beeinflussen.

### Später
- [ ] Kostenpflichtige Tickets erst nach sicherer Punktebuchung aktivieren.
- [ ] `!ticket`, `!wheel`, `!rad` erst nach ausdrücklicher Aktivierung im zentralen Command-System freischalten.
- [ ] Kanalpunkte-Wheel ohne Giveaway als separaten globalen Wheel-Use-Case anbinden.
- [ ] Dashboard für aktive Giveaways / Winner / Wheel-Permissions ausbauen.
