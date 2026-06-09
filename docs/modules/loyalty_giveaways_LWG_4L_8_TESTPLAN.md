# Loyalty Giveaways – LWG-4L.8 Testplan

Dieser Schritt testet die fachliche Ticket-Anzahl-Verarbeitung.

## Schwerpunkt
- `!ticket 2`
- maxTicketsPerUser
- keine Überschreitung des Limits

## Keine Codeänderung
Codebasis bleibt `STEP_LWG_4L_5`.

## Risiko, das geprüft wird
Wenn ein User schon Tickets besitzt, darf eine weitere Teilnahme das konfigurierte Limit nicht überschreiten.
