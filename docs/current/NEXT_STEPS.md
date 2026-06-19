# Next Steps – LWG Giveaway-bound Wheel

Stand: 2026-06-19

## Aktueller bestätigter Stand

Letzter bestätigter Overlay-/Regression-Stand:

```text
LWG-WHEEL-TEXT-RADIAL-5
```

Bestätigt:

- `loyalty_giveaways` grün.
- `loyalty_games` grün.
- Bound-Wheel-Felder abrufbar.
- Wheel-Overlay initial unsichtbar.
- Wheel-Spin blendet Overlay ein.
- Ergebnis wird angezeigt.
- Overlay blendet wieder aus.
- Winner-/Finale-Overlay bleibt aus.
- Letzter Regression-Spin mit echten Bound-Wheel-Feldern gewann `Valheim`.

## Nächster technischer Schritt

### LWG Bound-Wheel Field Count Rule

Ziel:

- Giveaway-bound Wheel soll nur noch verfügbare echte Gewinnfelder anzeigen.
- Keine Auffüllung auf 12 sichtbare Felder.
- Aktuelle Beobachtung:

```text
Bound-Wheel count/fieldCount = 8
Davon quantityRemaining > 0 = 7
Spin-Metadata: fieldsCount = 7
Spin-Metadata: visualFieldsCount = 12
```

Gewünschte Regel:

```text
2+ verfügbare Gewinne  → normaler Spin mit exakt diesen Feldern
1 verfügbarer Gewinn   → kein normaler Spin, letzter Gewinn direkt vergeben / separates Letzter-Gewinn-Overlay
0 verfügbare Gewinne   → Claim/Spin blockieren
```

Betroffene Dateien vor Umsetzung prüfen:

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
backend/modules/loyalty_giveaways.js
config/loyalty_games.json
```

Wichtig:

- Die hochgeladene Live-`loyalty_games.json` enthält aktuell kein `minVisibleSlots`.
- Der Wert 12 kommt vermutlich aus Backend-Default/Fallback.
- Nicht blind in JSON herumprobieren.
- Erst echte Dateien prüfen, dann Plan, dann auf `go` warten.

## Danach

1. Single-Remaining-Gewinn-Regel implementieren/testen.
2. Reset-/Hide-Testmöglichkeit für Wheel-Overlay sauber dokumentieren oder als geschützte Diagnosefunktion bauen.
3. Exclusion/Ausschlussliste ins Dashboard/Backend planen.
4. Test-Giveaway aufräumen oder als Test markieren.
5. Gamble-Alias-Bug separat prüfen.
