# NEXT_STEPS Ergänzung – nach STEP201.6 Challenge Diagnostics

Stand: 2026-05-08

## Nach STEP201.6

Challenge sollte nach Deploy/Test 6/6 im Modulstandard erreichen:

```text
/api/challenge/status
/api/challenge/config
/api/challenge/settings
/api/challenge/routes
/api/challenge/integration-check
/api/challenge/reload
```

## Nächste sinnvolle Kandidaten

Nach erfolgreichem Challenge-Test:

1. Clip-System prüfen (`clip: 1/6` laut Matrix)
2. Deathcounter prüfen (`deathcounter: 0/6` laut Matrix)
3. Hug/Rehug prüfen, falls dort Standard-Endpunkte fehlen

## Bewusst nicht jetzt

- Kein Dashboard-Modul für Challenges bauen.
- Keine Challenge-Texte in DB migrieren.
- Keine Challenge-Stats auf Core-DB umbauen.
- Keine Overlay-UX ändern.
