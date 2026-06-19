# Project State – LWG Wheel Text Radial 5

Datum: 2026-06-19

## Projektstand

Das Giveaway-bound Wheel Backend und das Wheel-Overlay sind im aktuellen Regression-Teststand grün. Der bestätigte Overlay-Stand ist:

```text
LWG-WHEEL-TEXT-RADIAL-5
```

## Bestätigt

- Backend Flow: OK
- Dashboard Copy: OK
- Bound-Wheel Copy: OK
- Wheel Claim: OK
- Wheel Spin: OK
- Overlay initial hidden: OK
- Overlay show on spin: OK
- Auto-Hide nach Ergebnis: OK
- Winner-/Finale-Overlay Isolation: OK
- Radiale Segmenttexte: OK
- Euro-Zeichen: OK
- Gewinnerbanner ohne Subtext: OK
- Lange Gewinnernamen: akzeptabel

## Letzte getestete IDs

```text
Giveaway:          giveaway_1781856708568_9653eba68a211017
Bound-Wheel:       giveawaywheel_1781856708568_839fb2b118fc40a3
Winner:            winner_1781857541326_7414ce0176034b92
Permission:        wheelperm_1781857541331_8b32049906e5064d
Echter Spin:       spin_1781857621153_3d98fd8542116333
Echter Gewinn:     Roadside Research
Regression Spin:   wheel_1781861576417_d4d3504840212e5e
Regression Gewinn: Valheim
```

## Letzter Modulstatus

```text
loyalty_giveaways: ok=True, enabled=True, version=0.1.12, lastError=
loyalty_games:     ok=True, enabled=True, version=0.2.7, lastError=
wheel:             ok=True, enabled=True, running=False, lastResult=Valheim
```

## Offene Regel vor Live-Nutzung

Giveaway-bound Wheel darf nicht mehr auf 12 sichtbare Felder auffüllen.

Gewünschte Regel:

```text
2+ verfügbare Gewinne  → normaler Spin mit exakt diesen verfügbaren Feldern
1 verfügbarer Gewinn   → direkt vergeben / Letzter-Gewinn-Overlay
0 verfügbare Gewinne   → Claim/Spin blockieren
```

## Nächster Fokus

1. Echte Dateien prüfen.
2. Auffülllogik/`minVisibleSlots` für Giveaway-bound Wheels lokalisieren.
3. Plan für Bound-Wheel-Feldanzahl + Single-Remaining-Gewinn-Regel machen.
4. Auf `go` warten.
5. Danach erst Code-Step bauen.
