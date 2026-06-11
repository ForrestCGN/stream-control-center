# LWG-4O.5c – Giveaways Tab statusLabel Fix

## Ziel

Der Giveaways-Tab im Loyalty-Dashboard reagierte nicht, weil `renderGiveaways()` `statusLabel(...)` verwendet hat, diese Helper-Funktion im aktuellen Live-Stand aber fehlte.

## Änderung

- `statusLabel(status)` wieder ergänzt.
- `statusBadge(status)` nutzt nun den deutschen Status-Text aus `statusLabel`.
- Direct-Navigation aus LWG-4O.5b bleibt erhalten.
- Keine Backend-, Claim-, Eventbus- oder Datenbankänderung.

## Test

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
```

Danach Dashboard hart neu laden und den Tab `Giveaways` anklicken.
