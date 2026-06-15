# Next Steps – nach LC-CORE-POINTS-3A

Stand: 2026-06-15

## Nächster Schritt

```text
LC-CORE-POINTS-3B – Event-Bonus-Livetest / Diagnose
```

## Ziel

Echte Twitch-Events sollen zeigen, ob der neue Loyalty-Consumer produktiv funktioniert:

```text
received steigt
processed steigt
errors bleibt 0
loyaltyEvents/Transaktionen steigen passend
Dedupe funktioniert bei Wiederholungen
```

## Prüfungen vor Umsetzung

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status" | ConvertTo-Json -Depth 8
```

## Danach mögliche Folgeblöcke

1. LC-CORE-POINTS-3C – Diagnose/Statusauswertung für Event-Bonus verbessern, falls Live-Test zu wenig sichtbar ist.
2. LC-CORE-CLEANUP-1 – alte Loyalty-StreamState-/Twitch-Direktlogik wirklich entfernen, aber erst nach separater Prüfung.
3. LC-CORE-ALERTS-1 – Alert-System später als separaten Consumer an Twitch-Events anbinden.
4. Neutrales Donation-/Payment-Event planen, nicht als Twitch-natives Event.
