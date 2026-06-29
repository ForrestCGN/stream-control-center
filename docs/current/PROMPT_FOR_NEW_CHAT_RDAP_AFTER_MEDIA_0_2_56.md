# Prompt fuer neuen Chat nach RDAP 0.2.56

Wir arbeiten an `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Aktueller Stand: `0.2.56 - Media Index Read Source`.

Wichtig:
- GitHub/dev ist Wahrheit.
- Erst echte Dateien aus GitHub/dev lesen, dann Plan, dann auf `go` warten.
- ZIPs mit echten Zielpfaden, kein Wrapper.
- Keine Upload/Edit/Delete-Funktionen ohne separate Freigabe.
- Keine Datei-Inhalte, keine absoluten Pfade.

Status:
- Agent sendet Full-Sync in Chunks.
- Remote-Receiver empfaengt alle validen Media-Items.
- Kontrollierter Write-Test hat `remote_media_index` mit 333 Items befuellt.
- MEDIA_INDEX Write/Data/FullSync Gates sind wieder deaktiviert.
- Gate-blockierte Full-Syncs zeigen `state: received_write_blocked`.
- `/api/remote/media/status` liest online jetzt `remote_media_index` read-only als primaere Quelle, wenn Tabelle kompatibel und befuellt ist.
- Agent-Memory bleibt Fallback und kann mit `?source=agent` geprueft werden.
- Keine Upload/Edit/Delete-Funktion.

Naechster sinnvoller Schritt: DB-Read-Source in der UI sichtbar bestaetigen/polishen, danach Delta-Sync/Loeschstatus separat planen.
