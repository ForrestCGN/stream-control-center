# LWG-4O.5c Test Commands

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
```

Dann im Browser:

```text
Strg+F5
Loyalty öffnen
Giveaways anklicken
```

Erwartung:

```text
Giveaways-Tab öffnet ohne statusLabel-Fehler.
```

Hinweis: 404 für `/api/obs/dashboard/status` und `/favicon.ico` sind für diesen Fix nicht relevant.
