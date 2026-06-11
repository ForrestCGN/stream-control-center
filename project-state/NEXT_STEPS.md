# NEXT_STEPS – stream-control-center

Stand: 2026-06-11

## Direkt nächster sinnvoller Schritt

```text
STEP213 / LWG-5.5 – !punkte / !points produktiv freigeben
```

Ablauf:

```cmd
.\stepdone.cmd "STEP213 / LWG-5.5 Points Command Freigabepaket"
```

```powershell
powershell -ExecutionPolicy Bypass -File .\Activate_STEP213_LWG5_5_points_command_ForrestCGN.ps1
powershell -ExecutionPolicy Bypass -File .\Test_STEP213_LWG5_5_points_command_live_ForrestCGN.ps1
```

Danach im Chat minimal prüfen:

```text
!punkte
!points
```

## Bei Problemen

```powershell
powershell -ExecutionPolicy Bypass -File .\Rollback_STEP213_LWG5_5_points_command_ForrestCGN.ps1
```

## Danach

Wenn STEP213 bestätigt ist:

```text
STEP214 – !givepoints getrennt testen/freigeben
STEP215 – !setpoint getrennt testen/freigeben
STEP216 – !gamble isoliert mit Testuser und kleinem Einsatz testen
```

Roulette bleibt vorgemerkt und wird jetzt nicht umgesetzt.
