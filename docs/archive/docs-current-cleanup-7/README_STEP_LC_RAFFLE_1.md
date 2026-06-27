# STEP LC-RAFFLE-1 – Einfaches !raffle im Loyalty-Giveaways-Modul

Stand: 2026-06-15

## Inhalt

Geändert wurde ausschließlich:

- `backend/modules/loyalty_giveaways.js`

## Funktion

- `!raffle` startet eine einfache Chat-Raffle.
- Standarddauer: 120 Sekunden.
- `!join` trägt Zuschauer einmalig ein.
- `!raffle status` zeigt Teilnehmerzahl und Restzeit.
- `!raffle cancel` bricht die laufende Raffle ab.
- Gewinner werden nach Ablauf automatisch gezogen und in den Chat geschrieben.
- Texte laufen über die vorhandenen Textvarianten des Moduls `loyalty_giveaways`.
- Das bestehende Giveaway-/Wheel-System bleibt erhalten.
- Kein neues Backend-Modul.
- Keine Punkte-Kosten, keine Punkte-Gewinne, kein `!sraffle`.

## Gewinnerregel

- 1 Teilnehmer: 1 Gewinner
- 2–10 Teilnehmer: Hälfte gewinnt, abgerundet
- 11–20 Teilnehmer: 1 Gewinner pro 4 Teilnehmer
- 21–50 Teilnehmer: 1 Gewinner pro 5 Teilnehmer
- 51–200 Teilnehmer: 1 Gewinner pro 8 Teilnehmer
- über 200 Teilnehmer: 1 Gewinner pro 20 Teilnehmer

## Tests

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

Nach Server-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/central-commands" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/raffle/status" | ConvertTo-Json -Depth 6
```

Chat-Test:

```text
!raffle
!join
!raffle status
!raffle cancel
```

## StepDone

Nach erfolgreichem Test:

```powershell
.\stepdone.cmd "STEP LC-RAFFLE-1 Einfaches !raffle mit !join im Loyalty-Giveaways-Modul"
```
