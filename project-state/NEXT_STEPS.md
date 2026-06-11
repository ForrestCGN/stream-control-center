# NEXT_STEPS – stream-control-center

Stand: 2026-06-11

## Direkt nächster sinnvoller Schritt

```text
STEP212b / LWG-5.4b – Points Command Runtime kontrolliert testen
```

Nach Entpacken des STEP212-Pakets:

```cmd
.\stepdone.cmd "STEP212b / LWG-5.4b Points Command Runtime Testscript und Doku"
```

Danach Backend neu starten und ausführen:

```powershell
powershell -ExecutionPolicy Bypass -File .\Test_STEP212B_LWG5_4b_points_command_runtime_ForrestCGN.ps1
```

## Erwartung

```text
- !punkte bleibt vor und nach dem Test im ursprünglichen Zustand.
- Das Script aktiviert !punkte nur temporär.
- !punkte zeigt verfügbare Kekskrümel + Rangdaten.
- !points Alias funktioniert.
- !punkte @user ist für Nicht-Mods blockiert.
```

## Danach

Wenn STEP212 grün ist:

```text
STEP213 / LWG-5.5 – Entscheidung: !punkte produktiv freigeben oder Gamble-Runtime isoliert testen
```

Empfohlene Reihenfolge:

```text
1. Erst !punkte / !points produktiv freigeben, falls gewünscht.
2. Danach !givepoints / !setpoint getrennt testen.
3. Danach !gamble isoliert mit Testuser und kleinen Einsätzen testen.
4. Roulette bleibt weiterhin nur vorgemerkt.
```


## STEP212b / LWG-5.4b – Points Runtime Testscript Args-Fix

```text
Stand: 2026-06-11
Typ: Testscript-/Doku-Hotfix
Runtime: unverändert
Grund: PowerShell-Parserfehler bei String mit $Enabled: behoben durch $($Enabled):
```
