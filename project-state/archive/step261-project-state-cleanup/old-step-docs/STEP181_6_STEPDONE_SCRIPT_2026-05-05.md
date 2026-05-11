# STEP181.6 - Stepdone Script

Stand: 2026-05-05

## Ziel

Nach manuellem Entpacken eines STEP-ZIPs soll nur noch ein Befehl noetig sein:

```powershell
.\stepdone "feat: update hug rehug text pairs"
```

Das Script macht den bekannten Standardablauf:

1. Git-Status anzeigen
2. relevante JS-Dateien per `node -c` pruefen
3. sichere Projektpfade fuer Git vormerken
4. Sicherheitscheck gegen Secrets/DB/Backups
5. Commit mit angegebener Commit-Message
6. Push nach `origin/dev`
7. bekanntes Live-Deploy-Script ausfuehren:
   - `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`
8. Abschlussstatus anzeigen

## Neue Dateien

```text
stepdone.cmd
tools/commands/stepdone.ps1
project-state/STEP181_6_STEPDONE_SCRIPT_2026-05-05.md
```

## Nutzung

```powershell
cd D:\Git\stream-control-center
.\stepdone "feat: update hug rehug text pairs"
```

Wenn keine Message angegeben wird, fragt das Script danach:

```powershell
.\stepdone
```

## Bewusst nicht enthalten

Das Script entpackt keine ZIPs.
ZIPs werden weiterhin manuell nach `D:\Git\stream-control-center` entpackt.

## Sicherheitsregeln

Das Script bricht ab, wenn staged Dateien verdächtig sind:

- `.env`
- Secrets
- SQLite/DB-Dateien
- ZIP/7z
- Backup-/Temp-Dateien
- Token-/Secret-/Password-/Credential-Pfade

## Hinweis

Wenn Backend-Dateien geaendert wurden und das Live-Deploy-Script Node nicht automatisch neu startet, muss das Backend danach manuell neu gestartet werden.
