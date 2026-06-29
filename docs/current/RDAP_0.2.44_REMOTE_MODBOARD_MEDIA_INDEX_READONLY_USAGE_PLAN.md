# RDAP 0.2.44 - Remote-Modboard Media Index Readonly Usage Plan

Stand: 2026-06-29

## Ziel

Dieser Step plant nur, ob und wie die vorhandene MariaDB-Tabelle `remote_media_index` spaeter als echte read-only Quelle oder Fallback fuer das Remote-Modboard-Media-System genutzt werden darf.

Es wird kein Runtime-Code geaendert.  
Es wird keine SQL-Datei ausgefuehrt.  
Es wird keine Datenbankmigration gemacht.  
Es werden keine Media-Daten geschrieben.

## Ausgangslage

```text
0.2.40:
- remote_media_index wurde auf dem Webserver angelegt.
- Tabelle existiert.
- Spalten vorhanden.
- Indizes vorhanden.
- row_count = 0.

0.2.42:
- GET /api/remote/media/status?db=1 liest das Schema read-only.
- Nutzt db.service.js / withReadOnlyConnection().
- Liest INFORMATION_SCHEMA.TABLES, INFORMATION_SCHEMA.COLUMNS, INFORMATION_SCHEMA.STATISTICS und SELECT COUNT(*).

0.2.43:
- Webserver-Deploy und Readback wurden dokumentiert.
- persistentIndex.ok=true.
- inspected=true.
- detected=true.
- itemCount=0.
- compatibleForRead=true.
- compatibleForWrite=false.
- writeEnabled=false.
- dataWritesEnabled=false.
- migrationEnabled=false.
```

## Grundsatz fuer spaetere Nutzung

```text
Agent-Memory bleibt vorerst die primaere Online-Wahrheit fuer Media-Inventar.
remote_media_index darf erst spaeter als read-only Quelle oder Fallback genutzt werden.
Dieser Step schaltet keine produktive Media-Quelle um.
Dieser Step aktiviert keine DB-Writes.
```

## Moegliche spaetere read-only Nutzung

`remote_media_index` koennte spaeter fuer diese Zwecke genutzt werden:

```text
- Diagnose: anzeigen, ob persistente Media-Index-Daten vorhanden sind.
- Fallback: falls Agent-Memory leer/nicht erreichbar ist, sichere DB-Lesedaten anzeigen.
- Vergleich: Agent-Memory vs. DB-Index vergleichen.
- Status: stale/deleted/last_seen_at Zustand sichtbar machen.
```

Nicht in diesem Step:

```text
- kein Umschalten der produktiven Media-Liste auf DB.
- kein DB-Fallback im Runtime-Code.
- keine UI-Auswahl zwischen Agent-Memory und DB.
- keine Schreibroute.
```

## Erlaubte DB-Felder fuer spaetere read-only Planung

Spaeter duerften aus `remote_media_index` nur sichere Metadaten gelesen werden:

```text
id
root_key
kind
relative_path
name
extension
size_bytes
modified_at
first_seen_at
last_seen_at
deleted
source
sync_version
updated_at
```

Nicht speichern/lesen als Media-Inhalt:

```text
- keine Datei-Inhalte
- keine absoluten lokalen Pfade
- keine Secrets
- keine Tokens
- keine freien Server-Dateipfade
```

## Read-only Bewertungsregeln fuer spaeter

Vor einer echten Runtime-Nutzung muessen diese Regeln definiert werden:

```text
deleted:
- deleted=0 waere sichtbar.
- deleted=1 waere standardmaessig ausgeblendet oder nur diagnostisch sichtbar.

last_seen_at:
- last_seen_at bestimmt, wann ein Medium zuletzt vom erlaubten Sync gesehen wurde.
- alte Werte duerfen als stale markiert werden.

stale:
- stale bedeutet: Eintrag existiert in DB, wurde aber laenger nicht bestaetigt.
- stale darf nicht automatisch geloescht werden.
- stale darf keine Writes ausloesen.

itemCount:
- itemCount ist nur eine read-only Zaehlinformation.
- itemCount=0 bedeutet: Schema vorhanden, aber keine persistierten Media-Eintraege.
```

## Spaetere API-Planung

Ein spaeterer Runtime-Step koennte eine read-only Struktur vorbereiten wie:

```text
persistentIndexSource: {
  prepared: true,
  enabled: false,
  readOnly: true,
  source: 'remote_media_index',
  canReadItems: true,
  canWriteItems: false,
  fallbackCandidate: true,
  primarySource: false,
  itemCount: 0,
  stalePolicyPrepared: true,
  deletedPolicyPrepared: true
}
```

Wichtig:

```text
compatibleForRead=true bedeutet nur: Schema kann gelesen werden.
Es bedeutet nicht: DB ist schon produktive Media-Wahrheit.
Es bedeutet nicht: Agent darf schreiben.
Es bedeutet nicht: Upload/Edit/Delete sind erlaubt.
```

## Risiken

```text
- Die Tabelle ist aktuell leer: itemCount=0.
- Ohne separaten Agent-Sync-Write-Step kommen keine echten Media-Daten in die Tabelle.
- Ein DB-Fallback darf nicht als aktuelle lokale Datei-Wahrheit missverstanden werden.
- deleted/stale/last_seen_at Logik muss vor Runtime-Nutzung exakt definiert werden.
- UI darf nicht suggerieren, dass Upload/Edit/Delete vorbereitet oder aktiv sind.
```

## Sicherheitsgrenzen

```text
Keine Runtime-Code-Aenderung.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine lokale SQLite-Schicht fuer Online.
Kein backend/core/database.js.
Kein backend/modules/sqlite_core.js.
Keine manuellen Server-Kopien.
Kein git pull im Live-Pfad.
Kein Webserver-Deploy.
```

## Checks

```powershell
Select-String -Path .\docs\current\RDAP_0.2.44_REMOTE_MODBOARD_MEDIA_INDEX_READONLY_USAGE_PLAN.md -Pattern "Agent-Memory","remote_media_index","read-only Quelle","Fallback","deleted","last_seen_at","Keine Media-Daten-Writes","Kein Webserver-Deploy"

git status
```

## Naechster sinnvoller Step

Nach lokalem Abschluss von 0.2.44 waere ein separater Runtime-Plan moeglich:

```text
RDAP_0.2.45_REMOTE_MODBOARD_MEDIA_INDEX_READONLY_SOURCE_STATUS_PLAN
```

Ziel dann nur planen oder gezielt vorbereiten, wie eine read-only DB-Quelle/Fallback-Statusstruktur aussehen darf. Weiterhin keine Media-Writes, keine Agent-Writes, kein Upload/Edit/Delete.
