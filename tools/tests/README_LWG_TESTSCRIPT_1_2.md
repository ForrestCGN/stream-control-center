# LWG TESTSCRIPT 1.2 - Interactive Giveaway Wheel Systemtest

## Zweck

Korrigierte Version des interaktiven Testscripts für normale Loyalty-Giveaways mit gebundenem Glücksrad.

## Änderungen gegenüber 1.1

- Hinweise von `!join` auf `!ticket` korrigiert.
- Erwartete Fehlerantwort beim Test "Draw aus OPEN" wird robust erkannt.
- `Invoke-RestMethod`-Fehlerdetails werden zusätzlich aus `ErrorDetails.Message` gelesen.
- Finales Summary-Schreiben robuster gemacht.
- Bestehender gesperrter Entry kann beim erneuten Lauf erkannt und übersprungen werden.

## Getesteter Ablauf

1. Giveaway öffnen oder vorhandenes offenes Giveaway weiterverwenden.
2. Gesperrten User per API hinzufügen, falls noch nicht vorhanden.
3. Drei erlaubte User schreiben im Chat `!ticket`.
4. Optional prüfen, dass Draw aus `open` blockiert wird.
5. Giveaway schließen.
6. Gewinner nacheinander ziehen.
7. Jeder Gewinner schreibt `!wheel` oder `!rad`.
8. Test endet, wenn keine eligible User mehr übrig sind.

## Startbeispiel

```powershell
powershell.exe -ExecutionPolicy Bypass -File .	ools	ests\loyalty_giveaway_wheel_interactive_test.ps1 `
  -GiveawayUid "giveaway_1781868290909_7944b21128b8d746" `
  -BlockedUser "una_solala"
```

Wenn ein bereits offenes Giveaway mit den vier Entries weitergetestet wird, kann das Script mit demselben Giveaway weiterlaufen; vorhandene Entries werden geprüft.
