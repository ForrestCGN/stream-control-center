# Current Status – stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Aktueller bestätigter Bereich

Loyalty-Giveaways mit gebundenem Giveaway-Glücksrad sind funktional im Backend getestet. Zusätzlich ist das Wheel-Overlay nach mehreren Layout-/Runtime-Fixes auf dem aktuellen Stand `LWG-WHEEL-TEXT-RADIAL-5` fachlich bestätigt.

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
- Wheel-Overlay ist initial unsichtbar.
- `loyalty.wheel.spin` blendet das Wheel-Overlay ein.
- Wheel dreht, zeigt Ergebnis und blendet danach automatisch aus.
- Winner-/Finale-Overlay bleibt beim Wheel-Spin aus.
- Segmenttexte laufen radial mit dem Segment.
- Lange Titel wie `Kingdom Come: Deliverance Royal Edition` sind akzeptabel lesbar.
- `€` wird korrekt dargestellt.
- Gewinnerbanner zeigt nur den Hauptgewinn, nicht `Steam Key`/`Guthaben`.
- Statuspanel links im Wheel-Overlay wurde entfernt.

## Zuletzt getestete IDs

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

## Neuester Overlay-Stand

Letzter bestätigter Overlay-Step:

```text
LWG-WHEEL-TEXT-RADIAL-5
```

Betroffene Datei:

```text
htdocs/overlays/loyalty/wheel_overlay.html
```

Bestätigtes Verhalten:

- Overlay initial unsichtbar.
- Einblendung über `loyalty.wheel.spin`.
- Ergebnis wird im Gewinnerbanner angezeigt.
- Auto-Hide nach Ergebnis.
- Statuspanel entfernt.
- Segmenttexte radial mit Segmentrichtung.
- Lange Segmenttexte akzeptabel.
- Gewinnerbanner bei langen Namen kleiner.
- Gewinnerbanner ohne Subtext.
- `€` korrekt.

## Letzter Modulstatus

`loyalty_giveaways`:

```text
ok=true
module=loyalty_giveaways
moduleVersion=0.1.12
enabled=true
lastError=
```

`loyalty_games`:

```text
ok=true
module=loyalty_games
moduleVersion=0.2.7
enabled=true
lastError=
```

Wheel:

```text
ok=true
enabled=true
running=false
lastError=
lastResult.selectedFieldLabel=Valheim
lastResult.finishedAt=2026-06-19T09:33:03.432Z
```

## Fachliche Entscheidung Feldanzahl / letzte Gewinne

Für Giveaway-bound Wheels gilt künftig als gewünschte Regel:

```text
2+ verfügbare Gewinne  → normales Glücksrad mit exakt diesen verfügbaren Feldern
1 verfügbarer Gewinn   → kein normales Rad mehr, letzter Gewinn wird direkt vergeben / separat angezeigt
0 verfügbare Gewinne   → Claim/Spin blockieren, Wheel ist erschöpft
```

Wichtig: Das Wheel darf bei Giveaway-bound Wheels nicht mehr optisch auf 12 Felder auffüllen. Die bisher beobachtete Differenz `fieldsCount=7` und `visualFieldsCount=12` muss im Backend/Wheel-Modul bereinigt oder für Bound-Wheels anders behandelt werden.

## Offene Hauptpunkte

- Backend-/Wheel-Regel: Giveaway-bound Wheels sollen exakt verfügbare Felder anzeigen, nicht `minVisibleSlots=12` auffüllen.
- Single-Remaining-Gewinn-Regel umsetzen: Bei nur 1 verfügbarem Gewinn keinen normalen Spin mehr starten.
- Direkter REST-/Dashboard-Test für `loyalty.wheel.reset`/Hide fehlt; Route `/api/communication-bus/publish` existiert nicht.
- Exclusion/Ausschlussliste sauber ins Dashboard integrieren.
- Gamble-Alias-Bug separat prüfen: `aliases` zeigt `[object`, `object]`.
- Test-Giveaway nach Tests löschen oder eindeutig als Test markieren.
