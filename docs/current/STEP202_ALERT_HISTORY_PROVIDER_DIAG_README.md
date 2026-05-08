# STEP202 – Alert History / Twitch-Tipeee Provider Diagnose

Dieses Tool schreibt die PowerShell-Diagnose komplett in Dateien.

Es löst NICHT aus:

```text
- keine Test-Alerts
- keine Webhooks
- kein Enqueue
- kein Replay
- kein Sound
- kein TTS
- keine Chat-/Discord-Nachricht
```

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP202_ALERT_HISTORY_PROVIDER_DIAG.ps1
```

## Ausgabe

```text
D:\gpt\last_api.json
D:\gpt\STEP202_ALERT_HISTORY_PROVIDER_DIAG_<timestamp>.log
D:\gpt\alerts_history_source_search.txt
D:\gpt\alert_provider_mapping_extract.txt
D:\gpt\alerts_status_compact.txt
D:\gpt\alerts_queue_compact.txt
D:\gpt\STEP202_alerts_routes.json
D:\gpt\STEP202_alerts_status.json
D:\gpt\STEP202_alerts_queue.json
D:\gpt\STEP202_alerts_history_expected_missing.json
D:\gpt\STEP202_kofi_status.json
D:\gpt\STEP202_tipeee_status.json
```

Bitte danach zuerst diese Dateien posten:

```text
D:\gpt\alerts_history_source_search.txt
D:\gpt\alert_provider_mapping_extract.txt
```

Falls die zu lang sind, zuerst `D:\gpt\last_api.json`.
