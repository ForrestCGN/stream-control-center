# STEP LC-RAFFLE-1B – Raffle Chat-Ausgaben über Helper

Stand: 2026-06-15

## Änderung

`!raffle` / `!join` bleiben im bestehenden Modul `backend/modules/loyalty_giveaways.js`. Es wurde kein neues Modul gebaut.

Ergänzt wurde:

- Modulversion `0.1.3`
- Build `STEP_LC_RAFFLE_1B`
- direkte Chat-Ausgabe für `raffle.*`-Meldungen über vorhandenen `helper_chat_output`
- je 5 Textvarianten für diese Keys:
  - `raffle.started`
  - `raffle.already_active`
  - `raffle.joined`
  - `raffle.already_joined`
  - `raffle.no_active`
  - `raffle.status`
  - `raffle.cancelled`
  - `raffle.no_entries`
  - `raffle.winners`
  - `raffle.permission_denied`

## Nicht geändert

- kein neues Raffle-Modul
- kein Dashboard
- keine Punktegewinne
- kein `!sraffle`
- keine Änderung am Punkteimport
- keine Alert-Änderung
- bestehende Giveaway-/Wheel-Funktionen bleiben erhalten

## Tests

```powershell
node -c .\backend\modules\loyalty_giveaways.js
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/raffle/status" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/chat-output/status" | ConvertTo-Json -Depth 6
```

Chat-Test:

```text
!raffle
!join
!join
!raffle status
!raffle cancel
```

Erwartung: Bei jedem Raffle-relevanten Fall erscheint eine Chatmeldung.
