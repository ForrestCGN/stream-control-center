# LWG-4O.5 Test Commands

## Syntax
```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
```

## Dashboard-Test
1. Backend neu starten.
2. Dashboard öffnen.
3. Loyalty → Giveaways öffnen.
4. Neues Giveaway erstellen:
   - Modus: Glücksrad-Giveaway
   - „Gewinner muss sich im Chat melden“ aktivieren
   - Timeout z. B. 120 Sekunden
   - „Rad erst nach Chatmeldung freigeben“ aktiv lassen
5. Glücksrad-Felder hinzufügen.
6. Giveaway öffnen.
7. Teilnehmer eintragen.
8. Teilnahme schließen.
9. Gewinner ziehen.
10. Prüfen:
   - Status zeigt „Wartet auf Chatmeldung“.
   - Chat-Claim Panel zeigt offene Claims.
   - Wheel-Permission ist noch nicht nutzbar, bis der Gewinner im Chat schreibt.
