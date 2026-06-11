# NEXT STEPS – Loyalty / Giveaways / Glücksrad nach LWG-4O.5e

## Priorität 1: Stabiler UI-Cleanup statt neue Runtime-Logik

### STEP LWG-4O.5f – Giveaway Form Claim/Wheel UI Cleanup

Ziel: Das Formular auf die fachlich entschiedene Logik bringen.

#### Normales Giveaway

- Checkbox anzeigen: `Gewinner muss Gewinn bestätigen`.
- Hilfetext: `Der gezogene Gewinner muss innerhalb der angegebenen Zeit eine Nachricht im Twitch-Chat schreiben. Erst dann gilt der Gewinn als bestätigt.`
- Timeout nur anzeigen, wenn die Checkbox aktiv ist.
- `Claim-Modus` vorerst verstecken oder simpel als `Irgendeine Chatnachricht` darstellen.

#### Wheel-Giveaway

- Keine Chat-Claim-Felder anzeigen.
- `Gewinner muss sich im Chat melden` nicht anzeigen.
- `Rad erst nach Chatmeldung freigeben` komplett entfernen.
- Hilfetext anzeigen: `Beim Glücksrad-Giveaway bestätigt der Gewinner durch das Drehen des Rads.`

#### Technische Vorgaben

- Erst aktuelle echte Datei `htdocs/dashboard/modules/loyalty_games.js` prüfen.
- Keine Backend-/DB-/Claim-Runtime-Änderung in 4O.5f, außer zwingend nötig.
- Direct Navigation aus 4O.5b erhalten.
- Helper aus 4O.5c/d/e erhalten:
  - `statusLabel`
  - `getChatClaimSettings`
  - `claimStatusLabel`
- Vor ZIP:
  - `node -c htdocs/dashboard/modules/loyalty_games.js`
  - statische Prüfung auf fehlende lokale Helper-Funktionen.
- ZIP mit Zielpfaden ab Repo-Root.
- StepDone nennen.

## Priorität 2: Wheel-Giveaway laufende Gewinner-Aktion planen

Nach 4O.5f erst fachlich finalisieren, dann bauen:

### Geplante Aktion: Nächsten Gewinner ziehen bei Wheel-Giveaway

Dialog:

```text
Was soll mit dem bisherigen Gewinner passieren?

[Bisherigen Gewinner ersetzen]
[Zusätzlichen Gewinner ziehen]
[Abbrechen]
```

#### Bisherigen Gewinner ersetzen

- Bisheriger Gewinner wird übersprungen.
- Er kann nicht mehr am Rad drehen.
- Neuer Gewinner wird gezogen.

#### Zusätzlichen Gewinner ziehen

- Bisheriger Gewinner bleibt dabei.
- Er darf später weiterhin drehen.
- Zusätzlich wird ein weiterer Gewinner gezogen.

UI soll keine technischen Begriffe verwenden:

- Kein `Drehrecht`.
- Kein `Permission`.
- Kein `revoked`.
- Kein `pending`.
- Kein `offene Drehung`.

## Priorität 3: Normales Giveaway Aktionen

Später nach UI-Cleanup:

- Gewinner ziehen.
- Wenn Gewinnbestätigung aktiv: warten auf Chatbestätigung.
- Manuell bestätigen.
- Gewinner überspringen / nächsten Gewinner ziehen.
- Giveaway beenden.

Keine Mehrfach-Claim-Fenster gleichzeitig.
