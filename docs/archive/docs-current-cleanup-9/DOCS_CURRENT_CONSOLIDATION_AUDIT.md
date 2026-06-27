# DOCS_CURRENT_CONSOLIDATION_AUDIT

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_4_MODULE_DOCS_CONSOLIDATION`

## Befund

Der gelieferte `stream-control-center` Snapshot enthaelt `1466` Dateien direkt unter `docs/current/`. Das ist fuer "current" zu viel. Viele Dateien sind historische Step-/CAN-/RDAP-Handoffs und gehoeren nicht dauerhaft in den aktiven Startbereich.

## Prefix-Verteilung aus Snapshot

| Gruppe | Anzahl |
| --- | --- |
| ADMIN_* | 6 |
| BUS_* | 4 |
| CAN* | 92 |
| DASH* | 12 |
| MASTER_PROMPT* | 2 |
| NEXT_CHAT_PROMPT* | 167 |
| OTHER | 873 |
| PROJECT* | 13 |
| RDAP* | 233 |
| REMOTE* | 15 |
| START_HERE* | 2 |
| STATUS/SYSTEM* | 33 |
| STEP* | 14 |

## Zielzustand fuer `docs/current/`

`docs/current/` soll nur enthalten:

- Start-/Master-/Arbeitsweise-Dateien
- aktuelle Projektuebersichten
- zentrale Modul-/Route-/Service-Doku
- aktuelle Roadmap/Next-Chat-Dateien
- wenige aktive Runbooks

Nicht dauerhaft dort bleiben sollen:

- alte `CAN*` Step-Handoffs
- alte `RDAP*` Step-Handoffs, die nicht aktueller Startfokus sind
- alte `STEP*` Statusnotizen
- alte generated/inspection/compare Reports
- Statussplitter, deren Inhalt bereits in `project-state/` oder zentrale Doku uebernommen wurde

## Step-4-Entscheidung

Dieser Step loescht noch keine `docs/current`-Historie. Er bereitet die Konsolidierungsbasis vor und liefert ein lokales Scan-Script. Der echte Loesch-/Archiv-Step kommt danach mit exakter Liste.

## Vorgeschlagene Step-5-Regeln

```text
KEEP_CURRENT:
  START_HERE, MASTER_PROMPT, aktuelle RDAP-Arbeitsweise, aktuelle Projektuebersichten,
  zentrale Modul-/Route-/Cleanup-Doku, aktueller Next-Chat-Prompt.

MERGE_THEN_DELETE:
  alte RDAP/CAN/STEP-Handoffs, deren technische Aussagen in zentrale Doku uebernommen sind.

ARCHIVE_ONLY:
  historische Meilenstein-Handoffs mit Diagnose-/Entscheidungswert.

DELETE_SAFE:
  generierte Listen, alte Compare-/Scan-/Temp-Reports, README-Dubletten, ersetzte Statussplitter.

REVIEW_MANUALLY:
  Dateien mit moeglichem Rechts-/Security-/DB-/Deploy-Kontext.
```

## Naechster Schritt

`RDAP_DOCS_CLEANUP_5_DOCS_CURRENT_SAFE_DELETE_OR_ARCHIVE` soll eine exakte Liste erzeugen und ausfuehrbar machen: entweder loeschen oder gezielt nach `docs/archive/legacy-current-2026-06-27/` verschieben.
