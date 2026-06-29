# CURRENT_STATUS

Aktueller Stand: `0.2.56 - Media Index Read Source`

## Kurzstatus

- Agent-Full-Sync in Chunks funktioniert.
- Remote-Receiver empfaengt vollstaendige Full-Syncs.
- `remote_media_index` wurde im kontrollierten Gate-Test mit 333 Items befuellt.
- MEDIA_INDEX Write/Data/FullSync Gates sind wieder deaktiviert.
- `/api/remote/media/status` nutzt online jetzt `remote_media_index` read-only als primaere Media-Quelle, wenn die Tabelle kompatibel und befuellt ist.
- Agent-Memory bleibt Fallback und kann mit `?source=agent` gezielt geprueft werden.
- UI/Status ist damit nicht mehr auf das 120er Compact-Memory-Limit angewiesen.

## Sicherheit

Es werden nur read-only SELECTs aus `remote_media_index` ausgefuehrt. Keine Upload/Edit/Delete-Funktion, keine Online->Agent-Dateiaktionen, keine Datei-Inhalte, keine absoluten Pfade, keine aktiven Media-Index-Writes.
