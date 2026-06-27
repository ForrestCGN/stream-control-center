# Current Status

Stand: 2026-06-27

## Version

Version 0.1.3 bleibt aktueller technischer Stand:

- Streaming-PC Verbindung vorbereitet.
- Komponentenstatus read-only.
- OBS-Status read-only.
- Keine Steuerung.
- Keine Writes.

## Aktueller Cleanup-Stand

`RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE` ist vorbereitet.

Dieser Step liefert:

```text
docs/current/DOCS_CLEANUP_2_SAFE_DELETE_MANIFEST.md
docs/current/STATS_REPORTS_CLEANUP_SUMMARY_CURRENT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_3.md
tools/cleanup/rdap-docs-cleanup-2-safe-delete.ps1
```

Der Cleanup-Script entfernt nur exakt gelistete Dateien:

- Runtime-Backup-/Step-Dateien aus `backend/` und `htdocs/`
- falsche `htdocs/htdocs/...`-Doppelverschachtelung
- alte `project-state/` Root-Dateien, sodass nur die fuenf Kern-Dateien uebrig bleiben

Keine Feature-Codeaenderung. Keine DB-Aenderung. Kein Webserver-Deploy erforderlich.
