# SO Sync Docs anwenden

Diese ZIP enthält bewusst ein append-only Script, damit bestehende Projektdateien nicht überschrieben werden.

Ausführen aus dem Repo:

```powershell
cd D:\Git\stream-control-center
.\tools\docs\apply_so_sync_docs_2026-06-21.ps1
```

Danach sind diese Projektdateien um markierte Blöcke ergänzt:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

Das Script ist idempotent: Wenn ein Marker bereits vorhanden ist, wird der Block nicht erneut eingefügt.
