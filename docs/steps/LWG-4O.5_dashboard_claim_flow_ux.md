# STEP LWG-4O.5 – Dashboard Claim-Flow UX

## Ziel
Die in LWG-4O.4 bestätigte automatische Chat-Claim-Pflicht wird im Loyalty-/Giveaway-Dashboard sichtbar und steuerbar gemacht.

## Geändert
- `htdocs/dashboard/modules/loyalty_games.js`

## Inhalte
- Giveaway-Formular unterstützt `chatClaim`:
  - Gewinner muss sich im Chat melden
  - Claim-Modus: irgendeine Chatnachricht
  - Timeout in Sekunden
  - Rad erst nach Chatmeldung freigeben
- Giveaway-Detailansicht zeigt einen eigenen Bereich „Chat-Claim / Gewinner-Meldung“.
- Gewinner-Tabelle zeigt Winner-Status und Chat-Claim-Status.
- Wheel-Giveaways können im Dashboard nun ebenfalls über „Gewinner ziehen“ ausgelost werden.
- Statuslabels wurden für `waiting_for_claim`, `waiting_for_wheel`, `wheel_completed`, `claim_confirmed` usw. ergänzt.
- Technische Mode-Namen werden in der UI nutzerfreundlicher angezeigt.

## Nicht geändert
- Keine DB-Änderung.
- Keine Backend-Logik geändert.
- Keine bestehende Funktionalität entfernt.
- Keine automatische Timeout-/Skip-Entscheidung ergänzt; das bleibt für spätere Flow-Schritte.

## Test
```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
```

Danach Dashboard öffnen und im Bereich Loyalty → Giveaways ein neues Giveaway mit aktivierter Chat-Claim-Pflicht erstellen.
