# LWG-4O.5b Test Commands

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
```

Dashboard danach hart neu laden:

```text
Strg+F5 im Browser
```

Manueller UI-Test:

```text
1. Linke Hauptnavigation öffnen.
2. Auf Loyalty klicken.
3. Erwartung: Direktes Loyalty-Modul, keine Zwischenkarte „Loyalty Games“.
4. Sidebar-Subtitle: Punkte, Giveaways, Glücksrad.
```
