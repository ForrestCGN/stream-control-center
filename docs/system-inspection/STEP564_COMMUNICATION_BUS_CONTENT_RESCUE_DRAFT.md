# STEP564 - Communication Bus Content Rescue Draft

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP564 sichert die relevanten Inhalte aus Batch C in einer aktiven Konsolidierungsdatei.

## Quellen

```text
project-state/STEP487_COMMUNICATION_BUS_MODULE_CONTRACT.md
project-state/STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md
```

## Neue aktive Datei

```text
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
```

## Wichtigste Konsolidierung

STEP487 plante einen separaten Helper:

```text
helper_communication_contract.js
```

STEP488 korrigierte dies:

```text
Kein dauerhafter helper_communication_contract.js.
Contract-Funktionen direkt in helper_communication.js.
```

## Ergebnis

Die Communication-Bus-Regeln sind jetzt aktiv gesichert:

```text
- keine Parallelstruktur
- Contract im bestehenden helper_communication.js
- bestehende Bus-Funktionen bleiben erhalten
- produktive Flows werden nicht ungeprüft ersetzt
- Event-/Action-Konventionen gesichert
- Test-/Prüfregeln gesichert
```

## Nicht geändert

```text
backend/**
htdocs/**
config/**
data/**
SQLite
Dashboard-Code
Overlay-Code
Runtime-Dateien
```

## Nächster Schritt

```text
STEP565 - Communication Bus Archive Dry-Run
```
