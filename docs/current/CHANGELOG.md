# CHANGELOG – Loyalty Giveaways / Glücksrad

## LWG-4M.8 – Runtime-Test dokumentiert
Datum: 2026-06-09 09:08:00 UTC

### Confirmed
- LWG-4M.5 Backend läuft aktiv mit `MODULE_BUILD = STEP_LWG_4M_5`.
- LWG-4M.6 Dashboard-Fix wurde im UI bestätigt.
- LWG-4M.7 Runtime-Test wurde erfolgreich abgeschlossen.
- Bound-Wheel wird beim Öffnen eines Wheel-Giveaways `active` und `locked=true`.
- Draw aus `open` wird blockiert.
- Close setzt `closed_for_entries`; Twitch Presence Chat-Fehler blockieren Close nicht.
- Draw erstellt Winner + pending Wheel-Permission mit Bound-Wheel-Metadata.
- Claim/Spin läuft erfolgreich und setzt Permission auf `used`.
- Giveaway wird nach Claim/Spin `finished`.

### Notes
- `Neues Rad für dieses Giveaway` ist aktuell noch nicht praktisch nutzbar, weil ein Bound-Wheel-Field-Editor bzw. Field-Snapshot fehlt.
- Empfohlener nächster Step: Option vorerst deaktivieren/ausblenden oder echten Field-Editor bauen.

## LWG-4M.6 – Dashboard Giveaway Wheel-Preset Visibility Fix

### Confirmed
- Wheel-Preset-Feld bei `Classic Single` und `Classic Multi` nicht mehr als nutzbare Auswahl sichtbar.
- Wheel-Preset-Feld bei `Wheel Single` und `Wheel Multi` sichtbar.

## LWG-4M.5 – Bound Wheel aktivieren und beim Claim/Spin verwenden

### Added
- `BOUND_WHEEL_STATUS` für Bound-Wheel-Lifecycle.
- Guard `getUsableBoundWheelForGiveaway()`.
- Aktivierung `activateBoundWheelForGiveawayRow()` beim Öffnen eines Wheel-Giveaways.
- Draw-Guard auf aktives Bound-Wheel.
- Permission-Metadata mit Bound-Wheel-Kontext.
- Claim-Guard gegen Permission-/Bound-Wheel-Mismatch.
- Spin-Start mit `source=giveaway_bound_wheel` und `sourceRefUid=<boundWheelUid>`.

### Changed
- `MODULE_BUILD` auf `STEP_LWG_4M_5`.
- `winner_drawn` Event-Payload korrigiert.

### Not changed
- Keine Punktebuchung.
- Keine Command-Aktivierung.
- Kein Streamer.bot.
