# RDAP 0.2.58M - Media Index Persistent Missing Tombstone Plan read-only

## Zweck

0.2.58M dokumentiert den sicheren Plan fuer normale lokal geloeschte persistente Media-Dateien.

Dieser Step ist bewusst read-only und ersetzt nicht den spaeteren produktiven Tombstone-/Cleanup-Step.

## Ausgangspunkt

0.2.58L ist bestaetigt:

```text
Alter sounds/tts/generated/** Legacy-DB-Eintrag wurde per gated Soft-Delete bereinigt.
Cleanup-Preview danach = 0.
Diff-Missing danach = 0.
Media-Index-Write-Gates sind wieder aus.
```

TTS-generated Dateien bleiben ein Sonderfall:

```text
sounds/tts/generated/** ist temporaer und wird nicht dauerhaft synchronisiert.
```

Normale persistente Media-Dateien sind ein anderer Fall.

## Statusmarker

```text
RDAP_0.2.58M_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_PLAN_READONLY
rdap_media_index_persistent_missing_tombstone_plan_058m.v1
```

## Fachliche Regel

Eine normale persistente Media-Datei darf nur dann als spaeterer Tombstone-Kandidat betrachtet werden, wenn alle Bedingungen erfuellt sind:

```text
1. Der Eintrag existiert aktiv in remote_media_index.
2. Der Eintrag ist kein sounds/tts/generated/** Sonderfall.
3. Der Agent-Full-Sync ist vollstaendig.
4. Der Agent-Snapshot ist nicht leer, nicht unavailable und nicht truncated.
5. Der DB-Snapshot ist nicht truncated.
6. Der Eintrag fehlt im vollstaendigen Agent-Snapshot.
7. Der Missing-Status ist read-only belastbar.
```

## Aktuelle Code-Basis

Die bestehende Diff-Route liefert bereits read-only Diagnose fuer Missing-on-Agent:

```text
GET /api/remote/media/index/diff/status
```

Aktuelle relevante Felder:

```text
counts.missingOnAgentReliable
counts.missingOnAgentCount
missingClassification.persistentMediaMissingCandidateCount
missingClassification.tombstoneCandidateDiagnosticCount
previews.missingOnAgent
previews.tombstoneCandidatesDiagnostic
fullSyncCompare.missingOnAgentReliable
reliability.missingOnAgentReliable
```

Wenn `missingOnAgentReliable` nicht `true` ist, darf daraus kein Tombstone-/Loeschstatus abgeleitet werden.

## Geplanter spaeterer Tombstone-Flow

Ein spaeterer produktiver Step darf normale persistente Missing-Kandidaten nur soft markieren.

Geplanter Ablauf:

```text
1. Read-only Preview aus vollstaendigem Full-Sync auswerten.
2. Candidate-Count und Kandidatenliste anzeigen.
3. Explizites confirmWrite verlangen.
4. Separates Confirm-Token fuer persistent-media-tombstone verlangen.
5. expectedCandidateCount pruefen.
6. Write-Gates pruefen.
7. Lock pruefen.
8. Audit vorbereiten.
9. DB-Backup/Readback-Konzept pruefen.
10. Erst dann deleted=1 / Tombstone-Status soft setzen.
11. Danach Readback und Audit pruefen.
```

## Verboten in 0.2.58M

```text
Kein DB-Write.
Kein UPDATE remote_media_index.
Kein deleted=1 fuer persistente Media-Dateien.
Kein Hard-Delete.
Kein physisches Loeschen.
Kein Online->Agent-Trigger.
Keine Datei-Inhalte.
Keine absoluten lokalen Pfade.
Keine Upload/Edit/Delete-Funktion.
Keine Agent-Action.
```

## Warum kein Auto-Delete

Normale persistente Media-Dateien koennen aus mehreren Gruenden fehlen:

```text
- Datei wurde wirklich lokal geloescht.
- Agent-Snapshot ist unvollstaendig.
- Full-Sync ist noch nicht abgeschlossen.
- Snapshot wurde nach Restart/Deploy geleert.
- DB- oder Agent-Liste ist gekuerzt.
- Pfad-/Metadatenvergleich ist nicht belastbar.
```

Deshalb bleibt Missing-on-Agent nur dann belastbar, wenn die Reliability-Felder das ausdruecklich erlauben.

## Test fuer diesen Plan-Step

Da 0.2.58M ein Doku-/Plan-Step ist, gibt es keine neuen Code-Checks.

Sinnvolle Statuspruefung auf dem Webserver bleibt:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .readOnly, .counts.missingOnAgentReliable, .counts.missingOnAgentCount, .missingClassification.persistentMediaMissingCandidateCount, .missingClassification.tombstoneCandidateDiagnosticCount, .reliability'
```

Erwartung beim zuletzt bestaetigten Stand nach 0.2.58L:

```text
readOnly = true
missingOnAgentItems = 0
persistentMediaMissingCandidateCount = 0
tombstoneCandidateDiagnosticCount = 0
```

## Naechster Step nach 0.2.58M

```text
RDAP_0.2.58N_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_GATED_PREP
```

Ziel fuer 0.2.58N:

```text
Gated Tombstone/Soft-Delete-Route fuer normale persistente Missing-Kandidaten vorbereiten.
Nur local-only.
Nur mit confirmWrite, Confirm-Token, expectedCandidateCount, Gates, Audit, Lock/Backup/Readback.
Kein physisches Loeschen.
Kein Online->Agent-Trigger.
```
