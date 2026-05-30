# STEP594 - Central Routes Inventory Draft

Version: 0.1.1  
Stand: 2026-05-30

## Fix in v0.1.1

v0.1.0 enthielt Markdown-Backticks in PowerShell-Strings und konnte dadurch nicht geparst werden.

v0.1.1 nutzt robuste String-Erzeugung ohne Markdown-Backticks in PowerShell-Strings.

## Ziel

Aus den echten STEP591/592/593-Scan-Ergebnissen eine zentrale scanbasierte Routen-Inventur erzeugen.

## Erzeugte Zieldatei

```text
docs/backend/ROUTES.md
```

## Script

```text
tools/system-inspection/create_central_routes_inventory_step594.ps1
```

## Wichtiger Hinweis

`docs/backend/ROUTES.md` ist scanbasiert.

```text
Regex-/Mention-Scan
False-Positives moeglich
dynamische Routen koennen fehlen
vor produktiven Entscheidungen echte Moduldatei pruefen
```

## Naechster Schritt

```text
STEP595 - Routes Inventory Review and Docs Update Plan
```
