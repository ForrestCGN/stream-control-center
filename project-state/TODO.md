# TODO – stream-control-center

Stand: 2026-06-11

## Erledigt / bestätigt

- [x] LWG-4Q.11 Manual Winner Flow API-seitig bestätigt.
- [x] STEP209 / LWG-5.1 Loyalty Safety Layer + Gamble vorbereitet.
- [x] STEP210 / LWG-5.2 API-/Status-Cleanup erstellt und STEP209-Sicherheitsbasis getestet.
- [x] STEP211 / LWG-5.3 Doku-/Projektstand aktualisiert.
- [x] STEP212b / LWG-5.4b Points Runtime kontrolliert bestätigt.

## Offen / wichtig

- [ ] STEP213 entpacken und StepDone ausführen.
- [ ] `Activate_STEP213_LWG5_5_points_command_ForrestCGN.ps1` ausführen.
- [ ] `Test_STEP213_LWG5_5_points_command_live_ForrestCGN.ps1` ausführen.
- [ ] Im Chat `!punkte` und `!points` minimal prüfen.
- [ ] Ergebnis dokumentieren.
- [ ] `!givepoints` getrennt testen, bevor produktiv aktiviert wird.
- [ ] `!setpoint` getrennt testen, bevor produktiv aktiviert wird.
- [ ] `!gamble` erst nach erfolgreichem Points-Release mit Testuser und kleinem Einsatz isoliert testen.
- [ ] Dashboard-Texteditor für Loyalty-/Games-Multitexte später sauber anbinden/prüfen.
- [ ] Gamble-Settings später im Dashboard bearbeitbar machen.
- [ ] Roulette nur vormerken, nicht in LWG-5.x umsetzen.

## Nicht wiederholen

- [ ] Keine Commands dauerhaft aktivieren, wenn nur temporär getestet werden soll.
- [ ] Keine großen JSON-Dumps in Tests ausgeben; nur relevante Felder.
- [ ] Keine produktive SQLite-Datei ersetzen oder überschreiben.
- [ ] Keine neuen parallelen Helper/Bus-Systeme bauen.
