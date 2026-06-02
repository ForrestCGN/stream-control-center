# NEXT_STEPS

## Direkt naechster Schritt

```text
CAN-27.1: Getrackten Doppelordner htdocs/htdocs sauber entfernen und dokumentieren.
```

## CAN-27.1 Anwendung

```powershell
cd D:\Git\stream-control-center

git rm "htdocs/htdocs/dashboard/modules/overlays.js"
git rm "htdocs/htdocs/overlays/Overlay Birthday.html"
git rm "htdocs/htdocs/overlays/_rahmen.html"

.\stepdone.cmd "CAN-27.1 Entferne getrackten htdocs-htdocs Doppelordner"
```

## Danach pruefen

```powershell
git ls-files "htdocs/htdocs/*"
Test-Path "D:\Git\stream-control-center\htdocs\htdocs"
Test-Path "D:\Git\stream-control-center\htdocs\dashboard\modules\overlays.js"
Test-Path "D:\Git\stream-control-center\htdocs\overlays\_overlay-birthday.html"
Test-Path "D:\Git\stream-control-center\htdocs\overlays\_rahmen.html"
```

Erwartung:

```text
git ls-files "htdocs/htdocs/*" gibt nichts aus.
Die echten Zielpfad-Dateien existieren weiterhin.
```

## Danach sinnvoll

```text
CAN-27.2: Repo/Live kurz abgleichen und entscheiden, welcher technische Block als naechstes kommt.
```

Moegliche Kandidaten:

```text
- Dashboard-Kosmetik fuer Overlay-Monitor Details, falls optisch noetig.
- Weitere Bus-Diagnose nur read-only ergaenzen.
- Naechstes Modul bewusst auswaehlen und mit Bus-/Status-/Doku-Regeln planen.
```

## Vor jedem naechsten Code-Step

```text
1. GitHub/dev und Live-Ziel abgleichen.
2. Echte Dateien lesen.
3. Ziel / Dateien / Aenderung / Nicht geaendert / Tests nennen.
4. Auf ausdrueckliches go warten.
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktive Sound-Bus-Migration.
Kein produktiver Sound-Bus-Play.
Kein Queue-Clear.
Keine Twitch-/Redemption-Write-Aktion.
Kein automatischer Shadow-Mitulauf fuer alle Rewards.
Keine Enable/Test/Migration-Buttons in der Sound-Shadow Card.
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine DB-Migration.
Keine Dashboard-Testbuttons fuer produktive Aktionen.
```
