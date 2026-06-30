# CHANGELOG

## 0.2.67 - Media Index Persistent Tombstone Test File Root Verify and Create Plan

- Root-Verifikationsplan fuer spaetere dedizierte Test-Media-Datei dokumentiert.
- Bestaetigter Basis-Pfad bleibt `D:\Streaming\stramAssets\htdocs\assets\media`.
- Festgehalten: Screenshot zeigt keinen sichtbaren `sounds`-Ordner auf oberster Ebene.
- `sounds` darf nicht geraten werden.
- Fallback auf vorhandenen Root `audio` dokumentiert.
- Fallback-Testpfad fuer spaeter: `audio/rdap-test/rdap-persistent-tombstone-test-001.mp3`.
- Keine Source-Dateien geaendert.
- Keine Testdatei angelegt.
- Keine lokale Dateiaktion.
- Keine DB-Zeile veraendert.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.
- Weiterhin kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

## 0.2.66 - Media Index Persistent Tombstone Test File Create Readonly Sync Plan

- Lokalen Ausfuehrungsplan fuer spaetere dedizierte Test-Media-Datei dokumentiert.
- Basis-Pfad aus Screenshot dokumentiert: `D:\Streaming\stramAssets\htdocs\assets\media`.
- Geplanter Pfad `sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3` als noch zu verifizieren markiert.
- Kein Code, keine Testdatei, keine DB-Aenderung, keine Gates, kein Execute.

## 0.2.65 - Media Index Persistent Tombstone Test File Readonly Prep Plan

- Konkrete Read-only-Vorbereitung fuer spaetere dedizierte Test-Media-Datei dokumentiert.
- Relativer Testpfad geplant: `sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3`.
- Keine Source-Dateien geaendert.
- Keine Testdatei angelegt.
- Keine DB-Zeile veraendert.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.

## 0.2.64 - Media Index Persistent Tombstone Candidate One Test Source Plan

- Testquelle fuer spaeteren echten `candidateCount=1`-Test geplant.
- Entscheidung: A, dedizierte Test-Media-Datei.
- Kontrollierte Test-DB-Zeile nur Reserve.
- Keine Source-Dateien geaendert.
- Keine Testdatei angelegt.
- Keine DB-Zeile veraendert.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.

## 0.2.63 - Media Index Persistent Tombstone Readonly Simulation Check bestaetigt

- Variante C read-only auf dem Webserver bestaetigt.
- Diff-Status und Persistent Tombstone Preview read-only geprueft.
- Full-Sync-Compare vollstaendig.
- Missing-Diagnose zuverlaessig.
- `persistentMediaMissingCandidateCount = 0`.
- `previewPersistentCandidateCount = 0`.
- `persistentTombstoneCandidates = []`.
- Gates nicht gesetzt bzw. nicht aktiv.
- Keine Source-Dateien geaendert.
- Keine DB-Zeile veraendert.
- Keine Datei geloescht.
- Kein echter Tombstone-Write ausgefuehrt.

## 0.2.62 - Media Index Persistent Tombstone Test Method Decision

- Kuerzeste sichere Testmethode entschieden.
- Variante C zuerst: reine Simulation / Read-only-Diagnose.
- Kein echter Kandidat erzeugt.
- Kein `candidateCount=1`-Test in diesem Step.
- Keine Source-Dateien geaendert.
- Keine DB-Zeile veraendert.
- Keine Datei geloescht.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.

## 0.2.61 - Media Index Persistent Tombstone Real Candidate Test Plan

- Read-only Testplan fuer echten persistenten Tombstone-Kandidaten dokumentiert.
- Keine Source-Dateien geaendert.
- Keine DB-Zeile veraendert.
- Keine Datei geloescht.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.
- Testvarianten dokumentiert: dedizierte Test-Media-Datei, kontrollierte Test-DB-Zeile, reine Simulation/Read-only-Diagnose.
- Remote-Modboard/Webserver und lokales Dashboard/Agent sauber getrennt dokumentiert.

## 0.2.60 - Media Index Persistent Tombstone Noop Execute with Gates bestaetigt

- Temporaer `MEDIA_INDEX_WRITE_ENABLED=true`, `MEDIA_INDEX_DATA_WRITE_ENABLED=true` und `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true` auf dem Webserver gesetzt.
- Execute mit `confirmWrite:true`, Confirm-Text und `expectedCandidateCount=0` getestet.
- Noop-Pfad bestaetigt: `reason = no_persistent_tombstone_candidates_to_soft_delete`.
- `writeExecuted=false`, `databaseWriteExecuted=false`, `softDeleteExecuted=false`, `hardDeleteExecuted=false`, `physicalDeleteExecuted=false`.
- Readback bestaetigt: `readBackCandidateCount=0`.
- `auditWritten=false`, da Noop ohne DB-Write.
- Gates danach wieder deaktiviert und per Env-Check bestaetigt.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.
