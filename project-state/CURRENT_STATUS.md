# CURRENT_STATUS

Aktueller Stand: `0.2.58M - Media Index Persistent Missing Tombstone Plan read-only vorbereitet`

## Ergebnis

0.2.58M ist ein Doku-/Plan-Step fuer normale lokal geloeschte persistente Media-Dateien.

Es wurden keine Code-Dateien geaendert und keine produktiven Writes vorbereitet oder ausgefuehrt.

Statusmarker:

```text
RDAP_0.2.58M_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_PLAN_READONLY
rdap_media_index_persistent_missing_tombstone_plan_058m.v1
```

## Ausgangspunkt

0.2.58L wurde lokal installiert, auf GitHub/dev deployed, auf dem Webserver getestet und fachlich bestaetigt.

Bestaetigter 0.2.58L-Status:

```text
Alter sounds:tts/generated/** Legacy-DB-Eintrag wurde per gated Soft-Delete bereinigt.
Cleanup-Preview danach = 0.
Diff-Status danach = missingOnAgentItems 0.
Media-Index-Write-Gates sind wieder aus.
```

## 0.2.58M-Regel

Normale persistente Media-Dateien duerfen nur read-only als spaetere Tombstone-Kandidaten betrachtet werden, wenn der Missing-on-Agent-Status belastbar ist.

Belastbar bedeutet:

```text
Agent-Full-Sync vollstaendig
Agent-Snapshot nicht unavailable
Agent-Snapshot nicht truncated
DB-Snapshot nicht truncated
Eintrag fehlt im vollstaendigen Agent-Snapshot
Kein TTS-generated Sonderfall
```

## Sicherheit

- Kein DB-Write.
- Kein `UPDATE remote_media_index`.
- Kein `deleted=1` fuer normale persistente Media-Dateien.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Upload/Edit/Delete-Funktion.
- Keine Agent-Action.

## Testhinweis

Da 0.2.58M Doku-only ist:

```text
kein Webserver-Deploy noetig
keine Node-Syntaxchecks noetig
```

Sinnvolle Statuspruefung bleibt:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .readOnly, .counts.missingOnAgentReliable, .counts.missingOnAgentCount, .missingClassification.persistentMediaMissingCandidateCount, .missingClassification.tombstoneCandidateDiagnosticCount, .reliability'
```

## Naechster sinnvoller RDAP-Step

```text
RDAP_0.2.58N_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_GATED_PREP
```

Ziel: Gated Tombstone/Soft-Delete-Route fuer normale persistente Missing-Kandidaten vorbereiten. Nur local-only, nur mit confirmWrite, Confirm-Token, expectedCandidateCount, Gates, Audit, Lock/Backup/Readback. Kein physisches Loeschen, kein Online->Agent-Trigger.
