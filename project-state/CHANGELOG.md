# CHANGELOG

## 0.2.58A - Media Index Diff Compare Normalization

- Read-only Diff-Diagnose nachgeschaerft.
- `sizeBytes` wird numerisch vergleichbar gemacht.
- `modifiedAt` wird als Timestamp mit kleiner Toleranz verglichen.
- Nicht vergleichbare Metadaten zaehlen nicht blind als `changed`, sondern werden als Warning ausgegeben.
- Ausgabe um `metadataCompareWarnings`, `changeReasonCounts` und `comparePolicy` ergaenzt.
- Keine DB-Writes, kein Upsert, kein Tombstone, keine Upload/Edit/Delete-Funktion, keine Datei-Inhalte, keine absoluten Pfade.

## 0.2.58 - Media Index Diff Diagnostic Read-only

- Neue Route `GET /api/remote/media/index/diff/status` ergaenzt.
- Agent-Snapshot wird read-only gegen `remote_media_index` verglichen.
- Ausgabe trennt neue, geaenderte, fehlende und unveraenderte Dateien.
- Wenn Agent-Snapshot gekuerzt ist, wird `missingOnAgent` nicht als belastbarer Loeschstatus bewertet.
- Keine DB-Writes, kein Upsert, kein Tombstone, keine Upload/Edit/Delete-Funktion, keine Datei-Inhalte, keine absoluten Pfade.

## 0.2.57 - Media Index Delta Sync Plan

- Delta-Sync-/Loeschstatus-Konzept dokumentiert.
- Neue, geaenderte, fehlende und unveraenderte Media-Dateien fachlich getrennt.
- Naechster technischer Schritt als read-only Diff-Diagnose geplant.
- Fehlende Dateien werden nicht blind geloescht; spaeter hoechstens Tombstone/`deleted=1` mit eigenem Gate, Confirm, Audit/Lock und Readback.
- Keine Runtime-Code-Aenderung, keine DB-Writes, keine Gate-Aktivierung, keine Upload/Edit/Delete-Funktion, keine Datei-Inhalte, keine absoluten Pfade.

## 0.2.56A - Media Sync Status DB Source UI

- UI-Sync-Karte nutzt bei aktiver DB-Read-Source die DB-Inventarzaehler statt die alte Compact-Agent-Progress-Anzeige.
- Online-DB aktiv zeigt jetzt 333 / 333 Dateien und 100%, sobald `/api/remote/media/status` aus `remote_media_index` liest.
- Sync-Info-Dialog beschreibt die aktive DB-Read-Source.
- Agent-Memory-Fallback per `?source=agent` bleibt unveraendert.
- Keine Backend-Write-Aktivierung, keine Upload/Edit/Delete-Funktion, keine Datei-Inhalte, keine absoluten Pfade.

## 0.2.56 - Media Index Read Source

- `/api/remote/media/status` liest online `remote_media_index` read-only als primaere Media-Quelle, wenn die Tabelle kompatibel und befuellt ist.
- Agent-Memory bleibt Fallback und ist per `?source=agent` pruefbar.
- DB-Items werden serverseitig erneut sanitisiert: rootKey, relativePath, Extension, Kind, PublicPath, Groessen- und Zeitfelder.
- `sourceInfo`, `syncInfo`, `syncFoundation`, `onlineIndexTarget` und `/api/remote/routes` melden die DB-Read-Source.
- Keine Media-Index-Writes aktiviert.
- Keine Upload/Edit/Delete-Funktion.
- Keine Datei-Inhalte, keine absoluten Pfade.
