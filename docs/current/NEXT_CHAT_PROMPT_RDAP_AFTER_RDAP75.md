# NEXT CHAT PROMPT - RDAP after RDAP75

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Verbindliche Arbeitsweise

```text
- Immer zuerst die genannten Startdateien wirklich lesen.
- GitHub/dev ist Wahrheit.
- Nicht blind aus Erinnerung arbeiten.
- Erst Plan nennen.
- Auf explizites go warten.
- Keine Code-/ZIP-Erstellung vor go.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine neuen parallelen Strukturen, wenn Erweiterung bestehender Dateien passt.
- Keine apply_patch-/Regex-/Set-Content-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIP in Downloads ab.
- Lokal: installstep.cmd aus D:\Git\stream-control-center.
- Danach lokale Checks und git status.
- Nur wenn sauber: stepdone.cmd.
- stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in remote-modboard/ und erst nach stepdone.cmd.
- Doku-only braucht keinen Webserver-Deploy.
```

## Startdateien lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP74_ADMIN_NOTES_HEADER_ACTIONS_DEDUP.md
docs/current/RDAP75_ADMIN_NOTES_PAGE_DESIGN_CONTRACT_AND_FINDINGS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP74 ist live deployed und optisch teilweise verbessert.
Header-Aktionen stehen oben im Admin-Notes-Header.
Die technische Doppel-Toolbar wurde reduziert.
```

## RDAP75 Findings / Design Contract

```text
Weiteres Layout-Gefrickel soll gestoppt werden.
Admin-Notes braucht einen verbindlichen Seitenaufbau.

Wichtigste Befunde:
- Notizen-Anzahl muss sich auf den aktuell ausgewaehlten User beziehen.
- Zieluser-Wechsel muss eindeutig die Notizen dieses Users zeigen/laden.
- Header/Router-State ist fehlerhaft, wenn "User-Detail" als Haupttitel stehen bleibt, obwohl Admin-Notes sichtbar ist.
```

## Verbindlicher Zielaufbau Admin-Notes

```text
1. Seitenheader:
   Admin-Notizen | Notizen neu laden | Neue Notiz

2. Zieluser-Auswahl:
   ausgewaehlter User ist Kontext fuer alles darunter.

3. Liste:
   Notizen fuer <DisplayName>
   <n> Notizen geladen

4. Create:
   nur sichtbar nach Klick auf Neue Notiz.

5. Diagnose/Technik:
   nicht prominent in Hauptansicht, spaeter hoechstens einklappbar.
```

## Naechster Step

```text
RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX
```

## Ziel RDAP76

```text
Frontend-only Fix fuer Header/Router-State.

Wenn Admin-Notizen sichtbar ist:
- Haupt-Header muss Admin-Notizen zeigen.
- Navigation/aktive Seite muss Admin-Notizen widerspiegeln.
- User-Detail darf nicht als Header stehen bleiben.
```

## Erlaubter Scope

```text
remote-modboard/backend/public/assets/remote-modboard.js
optional remote-modboard/backend/public/assets/rdap28-admin-notes.js nur wenn zwingend fuer Router/Header-State noetig
optional docs/current/* und project-state/*
```

## Leitplanken RDAP76

```text
- Kein Backend.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Community-Read-Freigabe.
- Kein Deactivate.
- Kein Delete.
- Keine Rollen-/Gruppen-/Permission-Writes.
- Keine parallele Zweitnavigation.
- Kein freier Router-Umbau, nur gezielter Header/State-Fix.
- Create/Update-Funktion erhalten.
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die Startdateien aus GitHub/dev und nenne danach nur den Plan fuer RDAP76. Kein Code/ZIP vor deinem go.
```
