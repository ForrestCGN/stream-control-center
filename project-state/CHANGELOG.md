# CHANGELOG

## 0.2.66 - Media Index Persistent Tombstone Test File Create Readonly Sync Plan

- Lokalen Ausfuehrungsplan fuer spaetere dedizierte Test-Media-Datei dokumentiert.
- Lokaler Basis-Pfad aus Screenshot dokumentiert: `D:\Streaming\stramAssets\htdocs\assets\media`.
- Geplanter relativer Testpfad dokumentiert: `sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3`.
- Geplanter Hold-Pfad dokumentiert: `D:\Streaming\stramAssets\htdocs\assets\media\_rdap_hold\rdap-persistent-tombstone-test-001.mp3`.
- Offene Root-Frage dokumentiert: Screenshot zeigt keinen sichtbaren `sounds`-Ordner auf oberster Ebene.
- Naechster Schritt muss `sounds` als Media-Root/Key verifizieren oder einen vorhandenen Root wie `audio` planen.
- Keine Source-Dateien geaendert.
- Keine Testdatei angelegt.
- Keine Datei verschoben oder geloescht.
- Keine DB-Zeile veraendert.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

## 0.2.65 - Media Index Persistent Tombstone Test File Readonly Prep Plan

- Konkrete Read-only-Vorbereitung fuer spaetere dedizierte Test-Media-Datei dokumentiert.
- Testpfad festgelegt: `sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3`.
- Keine Source-Dateien geaendert.
- Keine Testdatei angelegt.
- Keine DB-Zeile veraendert.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.

## 0.2.64 - Media Index Persistent Tombstone Candidate One Test Source Plan

- Entscheidung fuer spaeteren echten `candidateCount=1`-Test dokumentiert.
- Bevorzugte Quelle: dedizierte Test-Media-Datei.
- Reserve: kontrollierte Test-DB-Zeile nur falls Testdatei-Variante nicht sauber steuerbar ist.
- Keine Source-Dateien geaendert.
- Keine Testdatei angelegt.
- Keine DB-Zeile veraendert.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.

## 0.2.63 - Media Index Persistent Tombstone Readonly Simulation Check bestaetigt

- Variante C read-only auf dem Webserver geprueft und bestaetigt.
- Diff-Status und Persistent Tombstone Preview gelesen.
- Full-Sync-Compare vollstaendig und Missing-Diagnose zuverlaessig.
- `persistentMediaMissingCandidateCount = 0`.
- `previewPersistentCandidateCount = 0`.
- `persistentTombstoneCandidates = []`.
- Gate-Check ergab keine gesetzten/aktiven Gate-Variablen.
- Keine Source-Dateien geaendert.
- Keine DB-/Dateiaenderung, keine Gates, kein Execute.

## 0.2.62 - Media Index Persistent Tombstone Test Method Decision

- Kuerzeste sichere Testmethode entschieden: Variante C zuerst.
- Variante C = reine Simulation / Read-only-Diagnose.
- Kein echter Kandidat wird erzeugt.
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

- Temporaer `MEDIA_INDEX_WRITE_ENABLED=true`, `MEDIA_INDEX_DATA_WRITE_ENABLED=true` und `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true` auf dem Webserver gesetzt.
- Execute mit `confirmWrite:true`, Confirm-Text und `expectedCandidateCount=0` getestet.
- Noop-Pfad bestaetigt: `reason = no_persistent_tombstone_candidates_to_soft_delete`.
- `writeExecuted=false`, `databaseWriteExecuted=false`, `softDeleteExecuted=false`, `hardDeleteExecuted=false`, `physicalDeleteExecuted=false`.
- Readback bestaetigt: `readBackCandidateCount=0`.
- `auditWritten=false`, da Noop ohne DB-Write.
- Gates danach wieder deaktiviert und per Env-Check bestaetigt.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

## 0.2.59 - Media Index Persistent Tombstone gated Execute Foundation

- `POST /api/remote/media/index/tombstone/persistent/execute` ergaenzt.
- Execute local-only, Confirm-Write, Confirm-Tombstone und `expectedCandidateCount` geschuetzt.
- Execute braucht drei Gates:
  - `MEDIA_INDEX_WRITE_ENABLED=true`
  - `MEDIA_INDEX_DATA_WRITE_ENABLED=true`
  - `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true`
- Execute bleibt Soft-Delete-only vorbereitet.
- Confirm-Block und Gate-Block auf Webserver bestaetigt.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.
