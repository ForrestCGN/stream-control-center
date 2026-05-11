# NEXT STEP - Nach STEP260 DeathCounter DB-Storage STABLE

## Aktueller Stand

DeathCounter-Storage-Umbau ist abgeschlossen und stabil bestätigt.

```text
Produktiv: database
JSON: manuelles Backup-/Exportformat
Dual-Write: aus
Streamer.bot-Test: erfolgreich
Live-Schreibtest !rip/!del: erfolgreich
```

## Nicht weiter am Storage-Grundsystem bauen

Der DeathCounter-Storage sollte jetzt erstmal nicht weiter umgebaut werden.

Nicht blind bauen:

```text
- Storage-Schalter
- erneuter JSON-Dual-Write
- Löschen der JSON-Datei
- Löschen der Import-/Preview-/Validation-Routen
- Dashboard-Komplettumbau
```

## Nächste sinnvolle Projektblöcke

Optional später für DeathCounter:

```text
STEP261: deathcounter_events live befüllen
STEP262: Dashboard-Ansicht für DeathCounter-Storage/Backups
STEP263: Backup-Liste/Export-Download im Dashboard
```

Alternativ neues Modul / anderer Block:

```text
- SoundAlerts/Alerts weiter vereinheitlichen
- Hug/Rehug Dashboard weiter abrunden
- Dashboard-Admin/Configs weiter ausbauen
- allgemeines Doku-Archivieren Phase 2
```

## Wenn DeathCounter geprüft werden soll

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/backup" | ConvertTo-Json -Depth 20
```
