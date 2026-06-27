# CURRENT CHAT HANDOFF – LWG-4L.7

## Ziel
Kontrollierter Live-Test für kostenlose Ticket-Teilnahme über das zentrale Command-System.

## Keine Codeänderung
Aktuelle Codebasis:
- backend/modules/loyalty_giveaways.js
- moduleBuild: STEP_LWG_4L_5

## Testumfang
1. Kostenloses Draft-Giveaway per API erstellen.
2. Giveaway öffnen.
3. !ticket im zentralen Command-System temporär aktivieren.
4. /api/commands/execute mit !ticket ausführen.
5. Prüfen, ob Entry für TestUser erstellt wurde.
6. Giveaway schließen/finishen oder canceln.
7. !ticket wieder deaktivieren.

## Erwartung
- !ticket wird vom zentralen Command-System an /api/loyalty/giveaways/runtime/chat-command gesendet.
- Bei offenem kostenlosem Giveaway wird ein Entry erstellt.
- Ergebnis enthält ticket.success bzw. ok=true auf Modul-Datenebene.
- Keine Punktebuchung.
- !wheel / !rad bleiben deaktiviert.

## Rollback
!ticket über /api/commands/upsert wieder enabled=false setzen.
