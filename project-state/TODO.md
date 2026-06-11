# TODO – stream-control-center

Stand: 2026-06-11

## Erledigt / bestätigt

- [x] LWG-4Q.11 Manual Winner Flow API-seitig bestätigt.
- [x] STEP209 / LWG-5.1 Loyalty Safety Layer + Gamble vorbereitet.
- [x] STEP210 / LWG-5.2 API-/Status-Cleanup erstellt und STEP209-Sicherheitsbasis getestet.
- [x] STEP211 / LWG-5.3 Doku-/Projektstand aktualisiert.
- [x] STEP212b / LWG-5.4b Testscript für Points Command Runtime vorbereitet.

## Offen / wichtig

- [ ] STEP212-Testscript im Live-System nach StepDone und Backend-Neustart ausführen.
- [ ] Ergebnis von `Test_STEP212B_LWG5_4b_points_command_runtime_ForrestCGN.ps1` dokumentieren.
- [ ] Entscheiden, ob `!punkte / !points` produktiv aktiviert werden soll.
- [ ] `!givepoints` getrennt testen, bevor produktiv aktiviert wird.
- [ ] `!setpoint` getrennt testen, bevor produktiv aktiviert wird.
- [ ] `!gamble` erst nach erfolgreichem Points-Test mit Testuser und kleinem Einsatz isoliert testen.
- [ ] Dashboard-Texteditor für Loyalty-/Games-Multitexte später sauber anbinden/prüfen.
- [ ] Gamble-Settings später im Dashboard bearbeitbar machen.
- [ ] Roulette nur vormerken, nicht in LWG-5.4 umsetzen.

## Nicht wiederholen

- [ ] Keine Commands dauerhaft aktivieren, wenn der Test nur temporäre Aktivierung verlangt.
- [ ] Keine großen JSON-Dumps in Tests ausgeben; nur relevante Felder.
- [ ] Keine produktive SQLite-Datei ersetzen oder überschreiben.
- [ ] Keine neuen parallelen Helper/Bus-Systeme bauen.


## STEP212b / LWG-5.4b – Points Runtime Testscript Args-Fix

```text
Stand: 2026-06-11
Typ: Testscript-/Doku-Hotfix
Runtime: unverändert
Grund: PowerShell-Parserfehler bei String mit $Enabled: behoben durch $($Enabled):
```

- [ ] STEP212b / LWG-5.4b Points Runtime Test erneut ausführen und bestätigen.
