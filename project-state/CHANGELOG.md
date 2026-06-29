# CHANGELOG

## 0.2.58C - Media Index Diff Agent Snapshot Status Diagnostic

- `agentSnapshotDiagnostic` in der read-only Diff-Route ergaenzt.
- Diagnose zeigt Agent-Verbindung, Connection-State, Heartbeat, letzten Media-Inventory-Sync, Media-Inventory-Rejects und Media-Full-Sync-State.
- Ursache fuer leeren Snapshot wird als `reason` ausgegeben: `agent_not_connected`, `media_inventory_not_received_since_restart`, `media_inventory_empty`, `media_inventory_rejected` oder `agent_snapshot_available`.
- Kein Agent-Trigger, keine Online->Agent-Dateiaktion.
- Keine DB-Writes, kein Upsert, kein Tombstone/`deleted=1`, keine Upload/Edit/Delete-Funktion, keine Datei-Inhalte, keine absoluten Pfade.

## 0.2.58B - Media Index Diff Agent Empty Unreliable

- Leerer oder nicht verfuegbarer Agent-Snapshot wird in der Diff-Diagnose nicht mehr als belastbare Grundlage fuer `missingOnAgent` bewertet.
- `missingOnAgentCount` wird bei leerem Agent-Snapshot `null`.
- `missingOnAgentReliable` wird `false`.
- `reliability.agentSnapshotUnavailable` und `agent.snapshotUnavailable` wurden ergaenzt.
- Status meldet `diff_available_agent_snapshot_unavailable`.
- Keine DB-Writes, kein Upsert, kein Tombstone/`deleted=1`, keine Upload/Edit/Delete-Funktion, keine Datei-Inhalte, keine absoluten Pfade.

## 0.2.58A - Media Index Diff Compare Normalization

- Diff-Metadatenvergleich normalisiert.
- `sizeBytes` wird numerisch verglichen.
- `kind` wird normalisiert verglichen.
- `modifiedAt` wird mit Toleranz verglichen.
- Nicht vergleichbare Metadaten erzeugen Warnungen statt blind `changed`.
- Ausgabe um `metadataCompareWarnings`, `changeReasonCounts` und `comparePolicy` erweitert.
- Keine DB-Writes, keine Upload/Edit/Delete-Funktion.

## 0.2.58 - Media Index Diff Diagnostic Read-only

- Neue read-only Route `/api/remote/media/index/diff/status`.
- Vergleicht Agent-Snapshot und `remote_media_index`.
- Zeigt neue/geaenderte/fehlende/unveraenderte Dateien als Counts und sichere Previews.
- Bei gekuerztem Agent-Snapshot ist `missingOnAgentReliable=false`.
- Keine DB-Writes, kein Upsert, kein Tombstone, keine Upload/Edit/Delete-Funktion.

## 0.2.57 - Media Index Delta Sync Plan

- Delta-Sync-/Loeschstatus-Konzept dokumentiert.
- Neue, geaenderte, fehlende und unveraenderte Media-Dateien fachlich getrennt.
- Naechster technischer Schritt als read-only Diff-Diagnose geplant.
- Fehlende Dateien werden nicht blind geloescht; spaeter hoechstens Tombstone/`deleted=1` mit eigenem Gate, Confirm, Audit/Lock und Readback.
- Keine Runtime-Code-Aenderung, keine DB-Writes, keine Gate-Aktivierung, keine Upload/Edit/Delete-Funktion, keine Datei-Inhalte, keine absoluten Pfade.
