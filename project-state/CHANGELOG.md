# CHANGELOG – stream-control-center

Stand: 2026-06-11

## 2026-06-11 – STEP212 / LWG-5.4 Points Command Runtime Testscript

### Hinzugefügt

```text
Test_STEP212_LWG5_4_points_command_runtime_ForrestCGN.ps1
docs/current/CURRENT_CHAT_HANDOFF_STEP212_LWG5_4.md
```

### Aktualisiert

```text
docs/modules/loyalty.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

### Ergebnis

```text
- Keine Runtime-JS-Änderung.
- Kein Command wird dauerhaft aktiviert.
- Testscript aktiviert !punkte nur temporär und stellt den ursprünglichen Status wieder her.
- Testscript prüft !punkte, !points Alias und Permission-Block für !punkte @user.
```

## 2026-06-11 – STEP211 / LWG-5.3 Dokumentation und Handoff

### Ergebnis

```text
Doku-/Projektstand für STEP209/STEP210 erstellt.
Keine Runtime-Dateien geändert.
```

## 2026-06-11 – STEP210 / LWG-5.2 API-/Status-Cleanup

### Ergebnis

```text
Module bleiben aktiv/online, Commands bleiben separat deaktiviert.
Statusfelder für Dashboard/Testausgaben bereinigt.
```

## 2026-06-11 – STEP209 / LWG-5.1 Loyalty Safety Layer + Gamble Prepared

### Ergebnis

```text
Zentrale verfügbare Kekskrümel, Reservierungen, sichere Spend/Award-Funktionen und Gamble-Grundlage vorbereitet.
Commands weiterhin deaktiviert.
```


## STEP212a / LWG-5.4a – Points Runtime Testscript Parserfix

```text
Stand: 2026-06-11
Typ: Testscript-/Doku-Hotfix
Runtime: unverändert
Grund: PowerShell-Parserfehler bei String mit $Enabled: behoben durch $($Enabled):
```
