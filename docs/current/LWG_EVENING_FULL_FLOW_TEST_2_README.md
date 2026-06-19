# LWG-EVENING-FULL-FLOW-TEST-2

Ziel: Abendstream-Test für Loyalty Giveaways + gebundenes Glücksrad.

## Scripts

- `tools/lwg_evening_full_flow_test.ps1`
  - Statuschecks
  - Giveaway auswählen
  - Bound-Wheel/Felder prüfen
  - optional Dashboard/Overlay öffnen
  - optional Giveaway öffnen
  - optional Test-Entries erzeugen
  - optional Ausschlussliste anwenden, wenn `tools/lwg_apply_winner_exclusion_to_entries.js` vorhanden ist
  - Close
  - Draw
  - Wheel-Permission
  - Wheel-Claim/Spin über Bus
  - Log-Datei

- `tools/lwg_overlay_bus_spin_test.ps1`
  - isolierter Overlay-/Bus-Test mit Bound-Wheel-Feldern eines Giveaways
  - ruft `/api/loyalty/games/wheel/spin` auf
  - sendet danach reset

## Beispiel

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\lwg_evening_full_flow_test.ps1 -OpenDashboard -OpenOverlay -ExclusionList ".\lwg_excluded_winners_resolved_YYYYMMDD_HHMMSS.json"
```

Nur Readiness ohne schreibende Aktionen:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\lwg_evening_full_flow_test.ps1 -NoWrite -OpenOverlay
```

Overlay-Bus isoliert testen:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\lwg_overlay_bus_spin_test.ps1 -OpenOverlay
```

## Hinweis zur Overlay-Sichtbarkeit

Das Script löst Wheel-Spins über die vorhandenen Bus-/WebSocket-Events aus. Die OBS-/Overlay-Sichtbarkeit muss über den bestehenden Bus/OBS-Visibility-Mechanismus geprüft werden. Nach Spin-Ende sendet das Script zusätzlich `/api/loyalty/games/wheel/reset`.
