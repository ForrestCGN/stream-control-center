# LWG-4O.5d Test Commands

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
```

Da der Dashboard-Test über Live läuft:

```powershell
.\stepdone.cmd "STEP LWG-4O.5d Giveaways Tab getChatClaimSettings Fix"
```

Danach Browser hart neu laden:

```text
Strg+F5
```

Test:

```text
Loyalty → Giveaways
```

Erwartung: Der Giveaways-Tab öffnet ohne Konsolenfehler.
