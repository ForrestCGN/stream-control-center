# STEP LC-RAFFLE-1C – Raffle-Gewinnpool mit Loyalty-Buchung

Stand: 2026-06-15
Modul: `backend/modules/loyalty_giveaways.js`

## Änderung

`!raffle` bleibt im bestehenden `loyalty_giveaways`-Modul und bucht nach der Ziehung automatisch Loyalty/Kekskrümel an die Gewinner.

Festwerte für diesen Zwischenstand:

```text
Dauer: 120 Sekunden
Teilnahme: !join
Teilnahme-Kosten: 0
Gewinnpool: 5000 Kekskrümel gesamt
Auszahlung: Math.floor(5000 / winnerCount) pro Gewinner
Rest: bleibt unverteilt
Modus: aktueller Loyalty-Modus, aktuell live
Transaktionstyp: raffle_win
Reason: loyalty_raffle_win
ReferenceType: raffle
ReferenceId: raffleUid
```

## Nicht geändert

```text
Kein neues Modul.
Kein Dashboard.
Kein !sraffle.
Keine Teilnahme-Kosten.
Keine Änderung am Punkteimport.
Keine Änderung an Alerts.
Keine Änderung an Wheel/Giveaway-Draw-Logik.
```

## Tests

```powershell
node -c .\backend\modules\loyalty_giveaways.js
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/raffle/status" | ConvertTo-Json -Depth 6
```

Chat-Test:

```text
!raffle
!join
nach Ablauf prüfen:
/api/loyalty/transactions?type=raffle_win&limit=10
/api/loyalty/giveaways/raffle/status
```

## StepDone

```powershell
.\stepdone.cmd "STEP LC-RAFFLE-1C Raffle Gewinnpool bucht Loyalty-Punkte"
```
