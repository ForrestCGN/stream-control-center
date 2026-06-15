# CHANGELOG – stream-control-center

Stand: 2026-06-15

## 2026-06-15 – LC-CORE-POINTS-1 Sub-Tier-Watch-Werte und Resub-Bonus

### Ergebnis

```text
Der Loyalty-Core wurde auf StreamElements-nahe Punktewerte vorbereitet. Watch-Punkte können jetzt nach Subscriber-Tier berechnet werden. Resub ist im Default aktiviert. Neue Watch-User erhalten keine Sofortpunkte mehr, sondern warten bis zum ersten Intervall.
```

### Backend

```text
- backend/modules/loyalty.js von 0.1.14 auf 0.1.15 erhöht.
- watch.subscriberTierAmounts ergänzt: 1000=6, 2000=8, 3000=10.
- SETTINGS_DEFINITIONS um watch.subscriberTierAmounts ergänzt.
- bonuses.resub.enabled im Default auf true gesetzt.
- calculateWatchAmount() nutzt Subscriber-Tier bevorzugt und subscriberMultiplier als Fallback.
- recordWatchHeartbeat() verarbeitet subscriberTier/subscriber_tier/tier/subTier/subscriptionTier.
- Presence-Runner gibt Subscriber-Tier an den Watch-Heartbeat weiter.
- Erster Watch-Heartbeat erzeugt initialen Watch-State ohne Sofortpunkte.
```

### Nicht geändert

```text
Keine Commands aktiviert.
Keine Live-/Shadow-Umstellung.
Keine produktive DB ersetzt oder gelöscht.
Keine Giveaway-/Games-Änderung.
Keine Dashboard-Neustruktur.
```

### Hinweis

```text
Bestehende DB-Settings werden nicht automatisch überschrieben. Nach Deploy /api/loyalty/settings prüfen und neue Werte bei Bedarf gezielt setzen.
```

## 2026-06-15 – LC-CORE-CLEANUP-1 Loyalty StreamState Cleanup

```text
Alte lokale Loyalty-StreamState- und Twitch-Direktlogik wurde entfernt. Loyalty bleibt Consumer von /api/twitch/events/stream-state.
```
