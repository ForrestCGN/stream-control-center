# RDAP 0.2.57 - Media Index Delta Sync Plan

## Zweck

0.2.56A bestaetigt die Online-DB als read-only Media-Quelle fuer das Remote-Modboard. Die UI zeigt den gefuellten `remote_media_index` sauber als primaere Quelle an.

Dieser Step plant den naechsten sicheren Sync-Ausbau. Er aendert keine Runtime-Logik und aktiviert keine Writes.

## Ausgangsstand

- Lokaler Stream-PC/Agent ist Datei-/Media-Wahrheit.
- Agent scannt lokale Media-Dateien read-only.
- Agent sendet Compact-Memory und Full-Sync-Chunks.
- Webserver empfaengt Full-Sync-Chunks.
- `remote_media_index` enthaelt aktuell 333 Items.
- `/api/remote/media/status` liest online read-only aus `remote_media_index`.
- Agent-Memory bleibt Diagnose-Fallback per `?source=agent`.
- MEDIA_INDEX Write/Data/FullSync Gates sind deaktiviert.

## Zielbild Delta-Sync

Delta-Sync soll spaeter kontrolliert erkennen, was sich zwischen lokaler Agent-Wahrheit und Online-DB unterscheidet.

Geplante Kategorien:

1. Neue Dateien
   - existieren lokal beim Agent
   - fehlen in `remote_media_index`
   - spaeter nur per gated Upsert in DB aufnehmen

2. Geaenderte Dateien
   - gleiche `id` / `rootKey` / `relativePath`
   - aber abweichende Metadaten wie `sizeBytes` oder `modifiedAt`
   - spaeter nur per gated Update in DB aktualisieren

3. Fehlende Dateien
   - existieren in `remote_media_index`
   - fehlen im aktuellen Agent-Snapshot
   - duerfen nicht blind geloescht werden
   - spaeter hoechstens als Tombstone markieren: `deleted=1`
   - nur mit separatem Gate, Confirm und sauberer Diagnose

4. Unveraenderte Dateien
   - Agent und DB stimmen ueberein
   - keine Aktion

## Naechster technischer Step nach diesem Plan

Empfohlen: `RDAP_0.2.58_MEDIA_INDEX_DIFF_DIAGNOSTIC_READONLY`

Ziel:

- Read-only Diff-Diagnose zwischen Agent-Snapshot und DB-Index.
- Nur Counts und sichere IDs/relative Pfade ausgeben.
- Keine absoluten lokalen Pfade.
- Keine Datei-Inhalte.
- Keine DB-Writes.
- Keine Upload/Edit/Delete-Funktionen.

Moegliche Diagnosefelder:

```text
agentTotal
remoteDbTotal
matchedCount
newOnAgentCount
changedOnAgentCount
missingOnAgentCount
unchangedCount
truncated
readOnly
writesEnabled=false
```

Sichere Preview-Regeln:

- maximal kleine Limits, z. B. 20 Eintraege pro Kategorie
- nur `id`, `rootKey`, `relativePath`, `kind`, `sizeBytes`, `modifiedAt`
- keine absoluten Pfade
- keine Public-URLs fuer Dateiaktionen
- keine Inhalte, keine Hashes aus Dateiinhalt

## Spaeterer Write-Step

Delta-Writes duerfen erst spaeter kommen und brauchen mindestens:

- `MEDIA_INDEX_WRITE_ENABLED=true`
- `MEDIA_INDEX_DATA_WRITE_ENABLED=true`
- eigenes Delta-Gate, z. B. `MEDIA_INDEX_DELTA_SYNC_ENABLED=true`
- confirmWrite im Request/Flow
- Audit-Konzept
- Lock-/Concurrency-Konzept
- Readback-Test
- klare Rollback-/Backup-Regel

Tombstone/Loeschstatus braucht zusaetzlich ein eigenes Confirm/Gate, weil geloeschte oder fehlende Dateien riskanter sind als Upserts.

## Ausdruecklich nicht Teil von 0.2.57

- Keine Runtime-Code-Aenderung.
- Keine DB-Migration.
- Keine DB-Writes.
- Keine Gate-Aktivierung.
- Keine Upload/Edit/Delete-Funktion.
- Keine Online->Agent-Dateiaktion.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Kein physisches Loeschen.
- Kein Webserver-Deploy noetig.

## Pruefung fuer diesen Doku-Step

Lokal nach Einspielen:

```powershell
git status
```

Da nur Markdown-Dateien betroffen sind, sind keine Node-Syntaxchecks und kein Webserver-Deploy erforderlich.
