# NEXT_STEPS

## Nach STEP474

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Keine JS-Dateien geändert, daher kein `node --check` nötig.
3. Doku-Dateien kurz prüfen:

```bat
dir docs\current\PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md

dir docs\current\PROJECT_MODULE_AND_ROUTE_MAP_2026-05-26.md

dir project-state\STEP474_DOCS_TODO_MODULE_CLEANUP.md
```

4. STEP abschließen:

```bat
.\stepdone.cmd "STEP474 Docs Todo Module Cleanup"
```

## Nächster sinnvoller Fach-STEP

```text
STEP475_SHOUTOUT_DASHBOARD_TABS
```

Ziel:

- Shoutout-Dashboard aufräumen.
- Tabs/Unterbereiche ergänzen:
  - Übersicht
  - Queues
  - Statistik
  - Timeline
  - Settings/Test
- Keine Backend-Logik ändern, sofern nicht zwingend nötig.
- Vor Umsetzung echte Dashboard-Dateien und `clip_shoutout.js` erneut prüfen.

## Danach offen

- Eingehende Twitch-Shoutouts per EventSub loggen.
- Inbound-Shoutouts getrennt in Statistik und Dashboard anzeigen.
- `stream_status` bei echtem Streamstart/Streamende live testen.
- Weitere Module schrittweise auf zentralen Stream-Status umstellen.
- Später separaten Doku-/Archiv-Cleanup planen, falls alte STEP-/APPEND-Dateien wirklich verschoben werden sollen.
