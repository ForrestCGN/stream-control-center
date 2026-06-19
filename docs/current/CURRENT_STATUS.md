# Current Status – stream-control-center / Loyalty-Giveaways / Glücksrad

Stand: 2026-06-19

## Aktueller bestätigter Bereich

Loyalty-Giveaways mit gebundenem Giveaway-Glücksrad sind funktional im Backend getestet.

Bestätigt:

- Giveaway-Kopien können erstellt werden.
- Bei Kopie wird ein eigenes Bound-Wheel erzeugt.
- Bound-Wheel-Felder werden kopiert.
- Test-Kopie war startbereit mit 8 Feldern.
- Open/Entry/Close/Draw funktioniert.
- Draw erzeugt bei Wheel-Giveaway eine pending Wheel-Permission.
- Wheel-Claim startet einen Wheel-Spin über `loyalty_games`.
- Spin speichert Ergebnis am Winner.
- Wheel-Permission wird auf `used` gesetzt.
- Winner wird auf `wheel_completed` gesetzt.
- Das gewonnene Bound-Wheel-Feld wird reduziert.
- WS/Broadcast kommt grundsätzlich im Wheel-Overlay an.

## Zuletzt getestete IDs

```text
Giveaway:      giveaway_1781856708568_9653eba68a211017
Bound-Wheel:   giveawaywheel_1781856708568_839fb2b118fc40a3
Winner:        winner_1781857541326_7414ce0176034b92
Permission:    wheelperm_1781857541331_8b32049906e5064d
Spin:          spin_1781857621153_3d98fd8542116333
Gewinn:        Roadside Research
```

## Neuester Overlay-Stand

ZIP geliefert:

```text
LWG_WHEEL_OVERLAY_RUNTIME_1.zip
```

Ziel:

- Wheel-Overlay initial unsichtbar.
- Show/Hide über Bus/WS.
- Auto-Hide nach Ergebnis.
- Reset blendet sofort aus.
- Feldtexte kompakter und zweizeilig.

Status:

- Noch im neuen Chat final testen.

## Offene Hauptpunkte

- Exclusion/Ausschlussliste sauber ins Dashboard integrieren.
- Wheel-Overlay Layout finalisieren, besonders lange Feldnamen.
- Wheel-Overlay Show/Hide final mit Bus-State testen.
- Test-Giveaway nach Tests aufräumen/löschen.
- Finale/Winner-Overlay `event_winner_overlay.html` separat prüfen, da es unerwartet sichtbar war.
