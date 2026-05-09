# STEP205 – Alert-Regel-Editor: dynamische Min/Max-Hinweise

Stand: 2026-05-09

## Ziel

Im Alert-Dashboard war im Regel-Editor nicht klar, was `Min-Wert` und `Max-Wert` je Alert-Typ bedeuten. Beim Wechsel von Bits zu Raid/Sub/Gift/Sub-Bombe blieben die generischen Labels stehen.

## Änderung

Datei:

- `htdocs/dashboard/modules/alerts.js`

Im Regel-Modal werden die Labels und Hinweise für Min/Max jetzt abhängig von Quelle und Typ angezeigt.

Beispiele:

- `twitch/bits` → `Min-Bits` / `Max-Bits`
- `twitch/raid` → `Min-Zuschauer` / `Max-Zuschauer`
- `twitch/gift_sub` → `Min verschenkte Subs` / `Max verschenkte Subs`
- `twitch/gift_bomb` → `Min Sub-Bombe` / `Max Sub-Bombe`
- `twitch/sub` → `Min Sub-Anzahl` / `Max Sub-Anzahl`
- `twitch/resub` → `Min Monate` / `Max Monate`
- `kofi/tipeee donation` → `Min-Betrag` / `Max-Betrag`

Beim Wechsel von Quelle oder Typ aktualisiert sich die Beschreibung direkt im Modal.

## Bewusst nicht geändert

- Keine Backend-Änderung.
- Keine DB-Änderung.
- Keine Regelwerte verändert.
- Keine bestehende Dashboard-Funktion entfernt.

## Test

Syntaxcheck:

```powershell
node -c htdocs/dashboard/modules/alerts.js
```

Manueller UI-Test:

1. Dashboard öffnen.
2. Alerts → Regeln.
3. Neue Regel öffnen.
4. Typ zwischen Bits, Raid, Sub, Gift Sub, Gift Bomb, Donation wechseln.
5. Prüfen, ob Min/Max-Labels und Beschreibung passend wechseln.
