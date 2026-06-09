# CURRENT CHAT HANDOFF – LWG-4L.8

## Ziel
Kontrollierter Live-Test für Ticket-Anzahl und Max-Ticket-Limit.

## Codebasis
Keine Codeänderung. Aktueller Code bleibt STEP_LWG_4L_5.

## Testumfang
1. Kostenloses Test-Giveaway mit maxTicketsPerUser=3 erstellen.
2. Giveaway öffnen.
3. !ticket temporär aktivieren, Cooldowns 0.
4. !ticket 2 ausführen.
5. Prüfen, ob TestUser mit 2 Tickets im Entry steht.
6. !ticket 2 erneut ausführen.
7. Erwartung: Limit verhindert Überschreitung oder Modul begrenzt korrekt. Beides muss beobachtet und dokumentiert werden.
8. !ticket wieder deaktivieren.
9. Test-Giveaway canceln.

## Erwarteter sicherer Endzustand
- !ticket enabled=false
- !wheel enabled=false
- Keine Punktebuchung
- Test-Giveaway gecancelt
