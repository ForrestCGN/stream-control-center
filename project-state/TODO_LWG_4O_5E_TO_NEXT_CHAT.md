# TODO – Loyalty / Giveaways / Glücksrad nach LWG-4O.5e

## Sofort

- [ ] Aktuelle echte `htdocs/dashboard/modules/loyalty_games.js` vom Live-/Repo-Stand prüfen.
- [ ] Giveaways-Formular fachlich bereinigen.
- [ ] Chat-Claim-Felder nur bei normalem Giveaway zeigen.
- [ ] Wheel-Giveaway: Chat-Claim-Felder ausblenden.
- [ ] Text `Gewinner muss sich im Chat melden` ersetzen durch `Gewinner muss Gewinn bestätigen`.
- [ ] Text/Option `Rad erst nach Chatmeldung freigeben` entfernen.
- [ ] Status-/Hilfetexte weniger technisch formulieren.
- [ ] Syntaxcheck und Helper-Check vor ZIP.

## Danach

- [ ] Wheel-Aktion `Nächsten Gewinner ziehen` mit Auswahl planen.
- [ ] Buttons formulieren: `Bisherigen Gewinner ersetzen`, `Zusätzlichen Gewinner ziehen`, `Abbrechen`.
- [ ] Backend-Flow für `ersetzen` / `zusätzlich` erst nach finaler Planung bauen.
- [ ] Normale Giveaway-Bestätigung mit manuellem Überspringen/Bestätigen sauber aufbauen.

## Nicht tun

- [ ] Keine globale Einstellung `Nur aktueller Gewinner darf drehen` einbauen.
- [ ] Keine Wheel-Chat-Bestätigung erzwingen.
- [ ] Keine Timerpflicht für Wheel-Giveaways einbauen.
- [ ] Keine technischen UI-Begriffe wie `Permission`, `revoked`, `pending`, `offene Drehung` anzeigen.
