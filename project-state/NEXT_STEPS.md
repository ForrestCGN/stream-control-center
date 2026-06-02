# NEXT_STEPS

## Direkt naechster Schritt

```text
CAN-26.3 abschliessen: Doku/Handoff committen und Live synchronisieren.
```

## Danach sinnvoll

```text
CAN-27.0: Neuen Arbeitsblock bewusst planen.
```

Moegliche Kandidaten:

```text
- Dashboard-Kosmetik fuer Overlay-Monitor Details, falls optisch noetig.
- Doppelte lokale Struktur `htdocs\htdocs\...` separat pruefen, nicht blind loeschen.
- Weitere Bus-Diagnose nur read-only ergaenzen.
- Naechstes Modul nur nach echtem Repo-/Live-Abgleich planen.
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

## Standardtests fuer Overlay-Monitor nach Aenderungen

```powershell
$o = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/client-control/status"

$o | Select-Object currentProgramSceneName,currentPreviewSceneName,currentProgramSceneKnown,sceneAwarenessMode,inventoryUpdatedAt,inventoryFromCache,inventoryFromMemory | Format-List

$o.summary | Select-Object total,online,info,warning,error,heartbeat,stale,dead,expectedInactive,expectedIdle,expectedNotActive,activeExpected | Format-List
```
