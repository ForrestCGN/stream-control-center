# NEXT STEPS – LWG-4O.3c

## Direkt als nächstes testen

1. Backend neu starten.
2. Syntax prüfen:

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

3. Kompletttest erneut ausführen:

```powershell
powershell -ExecutionPolicy Bypass -File .\LWG-4O3_full_claim_test_ForrestCGN.ps1 -ClaimTimeoutSeconds 120
```

4. Als ForrestCGN im Twitch-Chat schreiben.

## Erwartetes Ergebnis

Der Chat-Claim sollte auf `confirmed` wechseln.

## Danach

Wenn bestätigt:

```text
LWG-4O.4 – Draw-Flow optional automatisch mit Claim-Pflicht/Wheel-Freigabe verbinden
```

Geplanter Fokus:

- Giveaway-Konfiguration für Claim-Pflicht sauber nutzen
- Nach Draw automatisch Claim-Fenster öffnen, wenn aktiv
- Bei confirmed erst danach Wheel-Permission aktivieren oder normalen Gewinn bestätigen
- Bei Timeout Gewinner überspringen / nächsten Gewinner vorbereiten
