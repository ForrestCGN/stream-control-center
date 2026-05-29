# STEP535 – Technical STEP Docs Cleanup Scan

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Nach STEP533 und STEP534 werden technische STEP-Dokus außerhalb von `docs/current/` gescannt und nach Themen gruppiert.

Dieser STEP löscht nichts.

## Scope

```text
docs/backend/*STEP*
docs/dashboard/*STEP*
docs/vip/STEP*
docs/overlays/STEP*
docs/media/*STEP*
docs/README_STEP*
docs/STEP*
```

## Bewusst ausgeschlossen

```text
docs/archive/*
docs/_generated/*
docs/modules/*
docs/current/*
project-state/*
```

Warum:

- Archive bleiben erstmal Archiv.
- Generated-Dokus sollen nicht manuell gepflegt werden.
- Module-Dokus sind teils aktive Referenz.
- `docs/current` wurde in STEP533/STEP534 bereits behandelt.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\scan_tech_step_docs_step535.ps1
```

## Ausgabe

```text
system-scan-output\step535_tech_step_docs_scan.json
system-scan-output\step535_tech_step_docs_summary.txt
system-scan-output\step535_tech_step_docs_candidates.txt
system-scan-output\step535_tech_step_docs_grouped.txt
```

## Nächster Schritt

Reports hochladen. Danach entscheiden wir, welche Themen zuerst konsolidiert werden:

- Alert/MediaId
- SoundBus/Sound-System
- Dashboard
- VIP
- Overlays
- alte README_STEP-Dokus
