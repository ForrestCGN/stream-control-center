# NEXT STEPS – STEP203 Alerts

Stand: 2026-05-09

## Direkt nach Deploy prüfen

1. Backend startet fehlerfrei.
2. `/api/alerts/status` liefert `ok: true`.
3. `/api/alerts/events?limit=100` liefert `ok: true`.
4. Dashboard `Alerts > Letzte Alerts` zeigt mehr als nur RAM-History.
5. Tipeee-Test mit Twitch-Mirror-Payload wird ignoriert.
6. Alerts disabled blockt Enqueue ohne Queue-/Event-Eintrag.

## Live-Testmatrix

```text
Twitch Bits -> nur Twitch Alert, kein Tipeee-Duplikat
Twitch Raid -> nur Twitch Alert, kein Tipeee-Duplikat
Twitch Follow -> follow
Twitch Sub -> sub
Twitch Resub -> resub
Twitch GiftSub -> gift_sub
Twitch CommunityGift/Sub-Bombe -> gift_bomb mit Anzahl
Ko-fi Donation -> kofi donation
echte Tipeee Donation -> tipeee donation
Tipeee-Spiegelung Twitch -> ignored_twitch_mirror
Alerts disabled -> kein Queue-Eintrag
```

## Danach

- Dashboard-Config für globalen Alert-Schalter UX-polieren.
- Alert-Regeln für `resub`, `gift_sub`, `gift_bomb` prüfen/anlegen.
- Falls Tipeee echte Non-Donation-Events später gebraucht werden, bewusst als eigene Regeln aktivieren.
