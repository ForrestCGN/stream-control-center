# NEXT STEPS – nach LWG-4O.4

## Direkt testen

1. ZIP einspielen.
2. Backend neu starten.
3. Syntax prüfen:

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

4. Auto-Claim-Test ausführen:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\tests\LWG-4O4_auto_claim_test_ForrestCGN.ps1 -ClaimTimeoutSeconds 120
```

## Danach

### LWG-4O.5 – Dashboard/UX

- Claim-Pflicht im Giveaway-Editor aktivierbar machen.
- Timeout, Modus und Wheel-Aktivierung anzeigen/editierbar machen.
- Status `waiting_for_claim` in der Giveaway-Karte darstellen.
- Aktionen vorbereiten:
  - Gewinner hat sich gemeldet
  - Gewinner nicht gemeldet
  - nächsten Gewinner ziehen
  - Giveaway beenden

### LWG-4O.6 – Timeout/Skip Runtime

- Abgelaufene Claim-Fenster automatisch als `expired` markieren.
- Optionalen Skip/Neuziehen-Flow implementieren.
