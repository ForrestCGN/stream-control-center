# Next Steps – stream-control-center

## Loyalty / Kekskrümel

Nächste Prüfung nach STEP208:

- Version `0.1.11` prüfen.
- Subscribe/Resub-Test durchführen:
  - erst Subscribe
  - innerhalb von 60 Sekunden Resub für denselben User
  - prüfen, ob der Subscribe kompensiert und der Resub normal gebucht wurde.
- Beim nächsten echten Stream erneut auswerten:
  - Runner-Recovery
  - Watch-Punkte
  - Event-Boni
  - GiftSub/GiftBomb
  - Subscribe/Resub-Dedupe
  - Bot-Ignore-Liste

Nächste mögliche fachliche Arbeit nach erfolgreichem Test:

- `soundalerts` als Service-Bot in Ignore-Liste aufnehmen, falls noch nicht geschehen.
- Loyalty Dashboard: Status, Runner-Events, User, Transaktionen und Auswertung sichtbar machen.
- Testdaten-Cleanup erst vor echter Live-Schaltung entscheiden.

## DeathCounter V2

Aktuell kein weiterer Pflicht-Umbau.

Empfohlene Prüfung:

- OBS Overlay show/hide prüfen.
- `!rip` / `!del` prüfen.
- Lange Namen prüfen.
- Zusatzspieler links/rechts prüfen.

Wenn visuell nötig: nur kleine CSS-Feinschliffe, keine Funktionsänderungen.
