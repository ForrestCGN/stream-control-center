# STEP537 – Post-Cleanup Docs Verification Scan

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Nach STEP533–STEP536 wird geprüft, welche technischen STEP-Dokus und TODO-/Marker-Hits noch im aktiven Doku-Bereich übrig sind.

Dieser STEP ist nur ein Kontrollscan.

## Prüft

- verbleibende technische STEP-Dokus außerhalb von `docs/archive` und `docs/_generated`
- konsolidierte Sammeldokus
- verbleibende TODO-/Marker-Hits außerhalb von Archiv/Generated
- `docs` und `project-state`

## Macht nicht

- keine Datei löschen
- keine Datei verschieben
- keine Runtime-Datei ändern
- keine Config/DB/Secrets anfassen

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\verify_docs_cleanup_step537.ps1
```

## Reports

```text
system-scan-output\step537_post_cleanup_docs_verification.json
system-scan-output\step537_post_cleanup_docs_verification_summary.txt
system-scan-output\step537_remaining_technical_step_docs.txt
system-scan-output\step537_consolidated_docs.txt
system-scan-output\step537_remaining_todo_hits.txt
```

## Danach

Reports hochladen. Danach entscheiden wir, ob noch ein Cleanup-Batch nötig ist oder ob wir den Doku-Cleanup abschließen.
