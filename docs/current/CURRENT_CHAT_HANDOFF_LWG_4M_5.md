# CURRENT_CHAT_HANDOFF_LWG_4M_5

Aktualisiert: 2026-06-09 08:31:22 UTC

## Aktueller Stand

Der vorbereitete Code-Step ist:

```text
LWG-4M.5 – Bound Wheel aktivieren und beim Claim/Spin verwenden
```

Backend-Datei:

```text
backend/modules/loyalty_giveaways.js
MODULE_BUILD = STEP_LWG_4M_5
```

## Was geändert wurde

- Bound-Wheel bekommt eigenen Status-Kontext `BOUND_WHEEL_STATUS`.
- `getUsableBoundWheelForGiveaway()` prüft:
  - Giveaway ist Wheel-Giveaway.
  - `wheelSnapshotUid` ist vorhanden.
  - Bound-Wheel existiert.
  - Bound-Wheel gehört zum Giveaway.
  - Bound-Wheel-UID passt zur `wheelSnapshotUid`.
  - `scope=giveaway`.
  - `sourcePresetUid` ist vorhanden.
  - Bei Draw/Claim: Status muss `active` sein.
- `activateBoundWheelForGiveawayRow()` setzt beim Öffnen eines Wheel-Giveaways:
  - `status=active`
  - `locked=1`
  - Aktivierungs-Metadata
- `drawWinner()` blockiert Wheel-Draw ohne aktives Bound-Wheel.
- Wheel-Permission enthält Bound-Wheel-Kontext.
- `claimWheelSpin()` startet über `source=giveaway_bound_wheel` und `sourceRefUid=<boundWheelUid>`.

## Nicht geändert

- Keine Punktebuchung.
- Keine Channel-Point-Anbindung.
- Keine Streamer.bot-Logik.
- Keine Aktivierung von `!ticket`, `!wheel`, `!rad`.
- Keine Dashboard-UI.
- Keine globale Wheel-Preset-Struktur entfernt.

## Nächster Test

```powershell
node -c .\backend\modules\loyalty_giveaways.js
.\stepdone.cmd "STEP LWG-4M.5 Bound Wheel aktivieren und beim Claim/Spin verwenden"
```

Danach Live-Test:
1. Wheel-Giveaway erstellen.
2. Bound-Wheel prüfen: zunächst `draft`.
3. Giveaway öffnen.
4. Bound-Wheel prüfen: `active`, `locked=true`.
5. Ticket eintragen.
6. Close.
7. Draw.
8. Permission prüfen: Bound-Wheel-Kontext vorhanden.
9. Claim/Spin ausführen.
10. Spin-Quelle prüfen: `giveaway_bound_wheel`, `sourceRefUid=<boundWheelUid>`.
