# Next Steps – LWG Wheel Overlay Runtime

Stand: 2026-06-19

## Nächster Chat – Startreihenfolge

1. Bestätigen, ob `LWG_WHEEL_OVERLAY_RUNTIME_1.zip` entpackt wurde.
2. Falls nicht, ZIP einspielen und StepDone ausführen:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "LWG-WHEEL-OVERLAY-RUNTIME-1 Overlay show-hide und Textlayout"
```

3. Wheel-Overlay in OBS/Browsertab refreshen:

```text
http://127.0.0.1:8080/overlays/loyalty/wheel_overlay.html
```

4. Prüfen: Overlay ist initial unsichtbar.
5. Direkten Spin-Test mit den Feldern der Test-Kopie ausführen.
6. Ergebnis beobachten:
   - Overlay blendet ein.
   - Rad dreht.
   - Gewinnertext erscheint.
   - Overlay blendet nach Hold-Zeit aus.

## Direkter Spin-Test

```powershell
$uid = "giveaway_1781856708568_9653eba68a211017"

$fields = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/$uid/wheel/bound/fields"

Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/loyalty/games/wheel/spin" `
  -ContentType "application/json" `
  -Body (@{
    source = "overlay_direct_test"
    sourceRefUid = $uid
    login = "overlay_test"
    displayName = "Overlay Test"
    durationMs = 7000
    fields = $fields.fields
    metadata = @{
      giveawayUid = $uid
      reason = "wheel_overlay_runtime_1_test"
    }
  } | ConvertTo-Json -Depth 10) |
  ConvertTo-Json -Depth 10
```

## Falls Overlay sichtbar bleibt

- Prüfen, ob wirklich `wheel_overlay.html` sichtbar ist und nicht `event_winner_overlay.html`.
- OBS-Quelle URL prüfen.
- Browsercache/OBS-Refresh durchführen.
- JS-Konsole öffnen.
- Nicht direkt an mehreren Overlays gleichzeitig debuggen.

## Danach

Wenn Runtime funktioniert:

- Segmenttextlayout final verbessern.
- Exclusion-Dashboard planen/umsetzen.
- Test-Giveaways aufräumen.
