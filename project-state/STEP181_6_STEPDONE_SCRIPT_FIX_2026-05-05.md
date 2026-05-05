# STEP181.6 Fix - Stepdone Script Syntax

Stand: 2026-05-05

## Problem

Die erste Version von `tools/commands/stepdone.ps1` hatte einen PowerShell-Parserfehler.

Fehler:

```text
Unerwartetes Token "}" in Ausdruck oder Anweisung.
```

## Fix

`stepdone.ps1` wurde vereinfacht und PowerShell-sicher neu geschrieben.

## Nutzung

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "feat: simplify hug rehug text pairs"
```

Oder ohne Message:

```powershell
.\stepdone.cmd
```

Dann fragt das Script nach der Commit-Beschreibung.

## Zweck

Nach manuellem ZIP-Entpacken:

1. Status anzeigen
2. JS-Syntax pruefen
3. relevante Projektdateien vormerken
4. Sicherheitscheck gegen Secrets/DB/Backups
5. Commit
6. Push nach `origin/dev`
7. bekanntes Live-Deploy-Script ausfuehren
8. Abschlussstatus anzeigen
