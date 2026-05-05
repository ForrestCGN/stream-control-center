# STEP181.7 - Stepdone CMD-only

Stand: 2026-05-05

## Grund

Die PowerShell-Version von `stepdone` verursachte einen Parserfehler auf Forrests System.

## Änderung

`stepdone.cmd` ist jetzt ein reines Batch-Script und ruft keine `stepdone.ps1` mehr auf.

## Nutzung

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "feat: simplify hug rehug text pairs"
```

Oder ohne Parameter:

```powershell
.\stepdone.cmd
```

Dann fragt das Script nach der Commit-Beschreibung.

## Ablauf

1. Git-Status anzeigen
2. relevante JS-Dateien per `node -c` prüfen
3. Projektdateien vormerken
4. einfacher Sicherheitscheck gegen Secrets/DB/Backups/ZIPs
5. Commit
6. Push nach `origin/dev`
7. bekanntes Live-Deploy-Script ausführen
8. Abschlussstatus anzeigen

## Hinweis

Die alte Datei `tools/commands/stepdone.ps1` wird nicht mehr benötigt.
