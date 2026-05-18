# STEP261 project-state Cleanup / Archivierung

Dieses Paket raeumt `project-state` auf, ohne Dateien zu loeschen.

## Wichtig

ZIP-Entpacken kann vorhandene Dateien nicht aus dem Root entfernen. Deshalb liegt ein einmaliger Apply-Befehl bei.

Nach dem Entpacken nach `D:\Git\stream-control-center`:

```powershell
cd D:\Git\stream-control-center
.\STEP261_APPLY_PROJECT_STATE_CLEANUP.cmd
.\stepdone.cmd "STEP261 project-state cleanup archive old fragments"
```

## Was passiert beim Apply?

Alte project-state-Dateien werden verschoben nach:

```text
project-state/archive/step261-project-state-cleanup/
```

Aktive Dateien bleiben im Root.

## Keine Runtime-Aenderung

Es werden keine Backend-, Dashboard-, Overlay-, DB-, Config- oder Streamer.bot-Dateien geaendert.
