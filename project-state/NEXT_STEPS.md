# NEXT STEPS

## Direkt nach STEP219

1. Paket entpacken.
2. Dokumentieren:

```cmd
.\stepdone.cmd "STEP219 / LWG-6.0 Gamble Readiness"
```

3. Readiness-Test ausführen:

```powershell
powershell -ExecutionPolicy Bypass -File .\Test_STEP219_LWG6_0_gamble_readiness_ForrestCGN.ps1
```

## Danach

```text
STEP220 / LWG-6.1 – Gamble kontrolliert temporär aktivieren, testen und wiederherstellen
```

STEP220 soll erst nach bestandenem STEP219-Test umgesetzt werden.
