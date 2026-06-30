# RDAP 0.2.58O - Media Index Persistent Tombstone gated Plan

## Zweck

0.2.58O dokumentiert den naechsten fachlichen Plan fuer normale persistente Media-Dateien, die nach einem vollstaendigen Agent-Full-Sync im lokalen Bestand fehlen und in `remote_media_index` noch aktiv sind.

Dieser Step ist bewusst ein Plan-/Doku-Step.

## Statusmarker

```text
RDAP_0.2.58O_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PLAN
```

## Ausgangspunkt

Bestaetigte Grundlage:

```text
0.2.58N - Media Index Diff Reliability Note Fix bestaetigt
statusApiVersion = rdap_media_index_diff_reliability_note_fix_058n.v1
routeBuild = RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX
readOnly = true
fullSyncCompareMissingOnAgentReliable = true
```

0.2.58N hat nur die Reliability-Notiz korrigiert. Die Route bleibt read-only.

Aktueller Webserver-Readback nach 0.2.58N:

```text
persistentMediaMissingCandidateCount = 0
tombstoneCandidateDiagnosticCount = 0
```

## Fachliche Entscheidung

Normale persistente Media-Dateien sind kein TTS-generated Sonderfall.

Wenn eine normale persistente Media-Datei im vollstaendigen Agent-Full-Sync fehlt, darf daraus nicht automatisch ein Delete entstehen.

Zulaessig fuer spaeter:

```text
read-only Diagnose -> Preview -> expliziter lokaler Confirm-Write -> Soft-Delete/Tombstone in remote_media_index -> Audit -> Readback
```

Nicht zulaessig:

```text
Auto-Delete
Hard-Delete
physisches Loeschen lokaler Dateien
Online->Agent-Trigger
Upload/Edit/Delete-Freigabe ohne eigenen Scope
```

## Geplanter spaeterer Write-Scope

Ein spaeterer eigener Code-Step darf nur geplant werden, wenn alle Schutzbedingungen eingehalten werden.

### Route Preview

Geplante Preview-Route:

```text
GET /api/remote/media/index/cleanup/persistent-missing/status
```

Eigenschaften:

- local-safe read-only
- zeigt nur Kandidaten
- keine DB-Writes
- keine Dateiaktion
- keine Agent-Aktion
- nutzt nur verlaesslichen Missing-Input

### Route Execute

Geplante Execute-Route:

```text
POST /api/remote/media/index/cleanup/persistent-missing
```

Nur spaeter, nicht in 0.2.58O.

Pflichtbedingungen fuer Execute:

- Request local-only (`127.0.0.1` / `::1`)
- `confirmWrite: true`
- eigenes Confirm-Token, z. B. `RDAP_0.2.58P_CONFIRM_PERSISTENT_MISSING_TOMBSTONE`
- `expectedCandidateCount`
- Media-Index-Write-Gates aktiv
- Permission-/Admin-Confirm-Helper verwenden
- Lock-/Audit-Konzept sichtbar
- Backup-/Rollback-Hinweis dokumentiert
- Readback nach Write

## Kandidatenregel

Ein persistenter Tombstone-Kandidat darf nur entstehen, wenn:

- DB-Eintrag ist aktiv (`deleted = 0`)
- `root_key` ist `sounds`, `videos` oder `images`
- `relative_path` ist sicher und relativ
- Datei ist nicht `sounds/tts/generated/**`
- Datei fehlt im vollstaendigen Agent-Full-Sync-Compare
- Full-Sync-Compare ist vollstaendig und nicht gekuerzt
- DB-Snapshot ist nicht gekuerzt
- Missing-Diagnose ist belastbar

## Tombstone-Art

Spaeterer Write darf nur Soft-Delete/Tombstone sein:

```text
UPDATE remote_media_index SET deleted = 1
```

Zusaetzlich spaeter sinnvoll:

- `source` auf Build-/Scope-spezifischen Wert setzen
- `sync_version` erhoehen
- `updated_at` aktualisieren
- Audit in `dashboard_audit_log`
- Readback: Kandidaten danach nicht mehr aktiv

## Sicherheitsgrenzen

0.2.58O aendert nichts produktiv.

Weiterhin verboten:

- keine produktiven Writes
- kein DB-Write
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- keine Datei-Inhalte
- keine absoluten lokalen Pfade
- keine Upload-/Edit-/Delete-Funktion
- keine automatische Tombstone-Erzeugung

## Tests fuer diesen Doku-Step

Da Doku-only:

```powershell
cd D:\Git\stream-control-center

git status
```

Kein Node-Neustart.
Kein Webserver-Deploy.

Optionaler Live-Statuscheck des bestehenden 0.2.58N-Codes:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .readOnly, .counts.missingOnAgentReliable, .counts.missingOnAgentCount, .missingClassification.persistentMediaMissingCandidateCount, .missingClassification.tombstoneCandidateDiagnosticCount, .reliability.note'
```

## Naechster sinnvoller Step

```text
RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW
```

Ziel fuer 0.2.58P:

- Preview-Route fuer persistente Missing/Tombstone-Kandidaten bauen.
- Weiterhin kein Execute-Write, falls Forrest nicht ausdruecklich den Write-Scope freigibt.
- Erst Kandidaten-Preview sauber lesbar machen.
