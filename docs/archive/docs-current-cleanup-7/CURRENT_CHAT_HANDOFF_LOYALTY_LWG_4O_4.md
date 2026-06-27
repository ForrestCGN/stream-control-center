# CURRENT CHAT HANDOFF – Loyalty/Giveaway LWG-4O.4

Aktueller Stand: `LWG-4O.4 Auto-Claim im Draw-Flow`.

Bestätigte Basis vor diesem Schritt:

- `LWG-4O.3c Twitch Payload Wrapper Alias Fix` wurde live getestet.
- `twitch.chat.message` kommt über den Communication-Bus bei `loyalty_giveaways` an.
- `forrestcgn` wurde korrekt aus `payload.twitch.user.login` erkannt.
- Claim-Bestätigung und Wheel-Spin funktionierten im manuellen Claim-Test.

Neuer Stand:

- Draw kann mit `chatClaim.enabled=true` automatisch ein Claim-Fenster öffnen.
- Wheel-Permission wird bei aktivierter Claim-Pflicht erst nach Chat-Bestätigung erstellt.
- Normal-Giveaway-Gewinner werden nach Chat-Bestätigung finalisiert.

Nächster sinnvoller Schritt:

- `LWG-4O.5` Dashboard-/Flow-UX: Claim-Pflicht im Giveaway-Editor sichtbar machen, Status sauber anzeigen und Aktionen für Timeout/erneut ziehen/weiteren Gewinner vorbereiten.
