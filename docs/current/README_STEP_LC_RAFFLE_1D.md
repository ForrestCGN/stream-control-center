# STEP LC-RAFFLE-1D – Raffle Chattexte ohne Pool-Anzeige

Stand: 2026-06-15

## Ziel

Die öffentlichen Chatmeldungen des einfachen `!raffle` wurden bereinigt:

- Der interne 5000er Gewinnpool wird im Chat nicht mehr angezeigt.
- Startmeldungen nennen nur noch `!join` und die Dauer.
- Gewinnertexte nennen Gewinnerliste und Gewinn pro Gewinner.
- Zahlen werden für Chatmeldungen deutsch formatiert, z. B. `5.000`.

## Nicht geändert

- Keine Änderung an der Buchungslogik.
- Keine Änderung am internen Gewinnpool von 5000 Kekskrümeln.
- Keine Änderung an `!raffle`, `!join`, `!raffle status`, `!raffle cancel`.
- Kein Dashboard.
- Kein neues Modul.
- Keine Teilnahme-Kosten.

## Tests

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

Nach Deploy/Restart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/raffle/status" | ConvertTo-Json -Depth 6
```

Chat-Test:

```text
!raffle
!join
```

Erwartung:

- Startmeldung enthält keinen Pool.
- Gewinnernachricht enthält keinen Pool.
- Gewinnernachricht nennt Gewinner und Betrag je Gewinner.
- `raffle_win`-Transaktion wird weiter korrekt gebucht.
