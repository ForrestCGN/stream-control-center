# STEP404A – VIP Preview Stable Check PS5.1 Fix

Status: Script-Fix für STEP404 Diagnose.

## Befund

Der STEP404-Stable-Check war funktional korrekt, konnte unter Windows PowerShell 5.1 aber eine Sicherheitsabfrage von `Invoke-WebRequest` auslösen, weil `-UseBasicParsing` fehlte.

## Fix

`Invoke-WebRequest -Uri $overlayUrl -Method Get -TimeoutSec 10`

wurde zu:

`Invoke-WebRequest -Uri $overlayUrl -Method Get -TimeoutSec 10 -UseBasicParsing`

## Risiko

Minimal. Es wird nur das Diagnoseskript angepasst. Keine produktive Backend-, Overlay- oder Bus-Logik wird verändert.

## Erwartung

Der Check läuft ohne interaktive Sicherheitsabfrage durch und endet bei stabilem System mit `STEP404A_STATUS=PASS`.
