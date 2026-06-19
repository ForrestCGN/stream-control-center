# LWG TESTSCRIPT 1.1 – Interactive Giveaway Wheel Systemtest

Pfad: `tools/tests/loyalty_giveaway_wheel_interactive_test.ps1`

Standardaufruf:

```powershell
.\tools\tests\loyalty_giveaway_wheel_interactive_test.ps1
```

Standardwerte:

- GiveawayUid: `giveaway_1781865593438_453d331727fe47d6`
- gesperrter User: `una_solala`
- erwartete Chat-User: `3`
- BaseUrl: `http://127.0.0.1:8080`

Ablauf:

1. Statusprüfungen.
2. Giveaway öffnen.
3. Gesperrten User per API eintragen.
4. Drei erlaubte User treten im Chat mit `!join` bei.
5. Draw aus OPEN wird optional als Guard-Test geprüft.
6. Entries werden geschlossen.
7. Es wird solange gezogen, bis drei eligible User gewonnen haben.
8. Jeder Gewinner muss selbst im Chat `!wheel` oder `!rad` schreiben.
9. Das Script prüft danach Winner-/Permission-/Feldstatus.
10. Am Ende wird ein weiterer Draw erwartet, der wegen fehlender eligible User scheitert.

Wichtig: Das Script macht keinen API-Fallback-Claim. Wenn `!wheel`/`!rad` nicht funktioniert, stoppt der Test und schreibt Log/JSON/API-Snapshots.

Logs:

- `test-logs/loyalty_giveaway_wheel_interactive_YYYYMMDD_HHMMSS/run.log`
- `test-logs/loyalty_giveaway_wheel_interactive_YYYYMMDD_HHMMSS/run.json`
- `test-logs/loyalty_giveaway_wheel_interactive_YYYYMMDD_HHMMSS/summary.txt`
- `test-logs/loyalty_giveaway_wheel_interactive_YYYYMMDD_HHMMSS/api/*.json`


## Fix in 1.1

- API-Felder werden robust gelesen, auch wenn `deletedAt`/`deleted_at` oder `entries` je nach Route fehlen.
- StrictMode ist deaktiviert, damit fehlende optionale API-Eigenschaften nicht den Testlauf abbrechen.
