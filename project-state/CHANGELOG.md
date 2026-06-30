# CHANGELOG

## 0.2.65 - Media Index Persistent Tombstone Test File Readonly Prep Plan

- Read-only-Vorbereitungsplan fuer die dedizierte Test-Media-Datei dokumentiert.
- Relativer spaeterer Testpfad festgelegt: `sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3`.
- Geplanten spaeteren Ablauf fuer Testdatei-Anlage, Missing-Situation, Preview und Rueckweg dokumentiert.
- Backup-/Hold-/Rueckweg-Prinzip dokumentiert.
- Remote-Modboard/Webserver und lokales Dashboard/Agent weiter getrennt gehalten.
- Keine Source-Dateien geaendert.
- Keine Testdatei angelegt, verschoben oder geloescht.
- Keine DB-Zeile veraendert.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

## 0.2.64 - Media Index Persistent Tombstone Candidate One Test Source Plan

- Quelle fuer spaeteren echten `candidateCount=1`-Test entschieden.
- Variante A bevorzugt: dedizierte Test-Media-Datei.
- Variante B als Reserve dokumentiert: kontrollierte Test-DB-Zeile nur falls A nicht sauber steuerbar ist.
- Vorgeschlagener relativer Testpfad dokumentiert: `sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3`.
- Keine Source-Dateien geaendert.
- Keine Testdatei angelegt.
- Keine DB-Zeile veraendert.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.

## 0.2.63 - Media Index Persistent Tombstone Readonly Simulation Check bestaetigt

- Variante C aus 0.2.62 auf dem Webserver read-only bestaetigt.
- Diff-Status und Persistent Tombstone Preview gelesen.
- Full-Sync-Compare vollstaendig und Missing-Diagnose belastbar.
- `persistentMediaMissingCandidateCount = 0` bestaetigt.
- `previewPersistentCandidateCount = 0` bestaetigt.
- `persistentTombstoneCandidates = []` bestaetigt.
- Gate-Check ohne Ausgabe: Gates nicht gesetzt bzw. nicht aktiv.
- Keine Source-Dateien geaendert.
- Keine DB-/Dateiaenderung, keine Gates, kein Execute.

## 0.2.62 - Media Index Persistent Tombstone Test Method Decision

- Testmethode entschieden: Variante C zuerst, reine Simulation / Read-only-Diagnose.
- Kein echter Kandidat erzeugt.
- Kein `candidateCount=1`-Test in diesem Step.
- Keine Source-Dateien geaendert.
- Keine DB-/Dateiaenderung, keine Gates, kein Execute.

## 0.2.61 - Media Index Persistent Tombstone Real Candidate Test Plan

- Read-only Testplan fuer echten persistenten Tombstone-Kandidaten dokumentiert.
- Keine Source-Dateien geaendert.
- Keine DB-Zeile veraendert.
- Keine Datei geloescht.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.
- Testvarianten dokumentiert:
  - echte dedizierte Test-Media-Datei
  - kontrollierte Test-DB-Zeile
  - reine Simulation/Read-only-Diagnose
- Remote-Modboard/Webserver und lokales Dashboard/Agent sauber getrennt dokumentiert.
- Weiterhin kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

## 0.2.60 - Media Index Persistent Tombstone Noop Execute with Gates bestaetigt

- Temporär `MEDIA_INDEX_WRITE_ENABLED=true`, `MEDIA_INDEX_DATA_WRITE_ENABLED=true` und `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true` auf dem Webserver gesetzt.
- Execute mit `confirmWrite:true`, Confirm-Text und `expectedCandidateCount=0` getestet.
- Noop-Pfad bestaetigt: `reason = no_persistent_tombstone_candidates_to_soft_delete`.
- `writeExecuted=false`, `databaseWriteExecuted=false`, `softDeleteExecuted=false`, `hardDeleteExecuted=false`, `physicalDeleteExecuted=false`.
- Readback bestaetigt: `readBackCandidateCount=0`.
- `auditWritten=false`, da Noop ohne DB-Write.
- Gates danach wieder deaktiviert und per Env-Check bestaetigt.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.
