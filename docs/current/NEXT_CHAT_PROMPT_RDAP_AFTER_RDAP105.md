# NEXT CHAT PROMPT - RDAP after RDAP105

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## WICHTIG

Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

GitHub/dev ist Wahrheit. Erst die Startdateien wirklich aus GitHub/dev lesen, dann Plan nennen, dann auf Forrests explizites `go` warten.

## Verbindliche Arbeitsweise

- Immer zuerst die genannten Startdateien wirklich aus GitHub/dev lesen.
- GitHub/dev ist Wahrheit.
- Nicht blind aus Erinnerung arbeiten.
- Erst Plan nennen.
- Auf explizites `go` warten.
- Keine Code-/ZIP-Erstellung vor `go`.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine neuen parallelen Strukturen, wenn Erweiterung bestehender Dateien passt.
- Neue Dateien nur, wenn Verantwortung fachlich wirklich getrennt ist.
- Keine `apply_patch`-/Regex-/`Set-Content`-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach lokale Checks und `git status`.
- Nur wenn sauber: `stepdone.cmd`.
- `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in `remote-modboard/` oder Server-Workflow-Scripts und erst nach `stepdone.cmd`.
- Auf dem Webserver als root arbeiten; kein sudo verwenden.
- Keine langen manuellen Deploy-Ketten als Standard.
- Ab RDAP104B gilt fuer Webserver-Deploys:
  `bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev`

## Zuerst wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25.md
docs/current/RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRMED.md
docs/current/RDAP105_DOCS_INVENTORY_AND_CLEANUP_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP105.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP104B:
- Server-Deploy-Wrapper live bestaetigt.
- Cleanup live bestaetigt.
- Neuer Ein-Befehl-Webserver-Deploy aktiv.

RDAP105:
- Doku-Inventur und Cleanup-Plan erstellt.
- docs/current und project-state sind als zu laut/ueberfuellt erkannt.
- Naechster Arbeitsblock ist Doku-Current-State-Rebuild.
- Feature-Step Stream-PC-Verbindungsdetails wurde bewusst nach hinten geschoben.
```

## Naechster sinnvoller Step

```text
RDAP106_DOCS_CURRENT_STATE_REBUILD
```

Ziel:

```text
- zentrale aktuelle Doku-Dateien neu aufbauen
- docs/current auf aktuelle Wahrheit/Startpunkte fokussieren
- historische RDAP/CAN/DASHUI-Dateien als Archiv behandeln
- project-state knapp und eindeutig halten
- neuen Next-Chat-Prompt aus der sauberen Struktur ableiten
```

## Strikt nicht machen

```text
Keine Feature-Implementierung.
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine DB-Migration.
Keine produktiven Writes.
Keine Runtime-Aktivierung.
Keine Secrets.
Keine Rohpayloads.
Keine Massenloeschung historischer Dateien.
Keine Datei-Verschiebungen ohne vorher klaren Zielpfad/Archivplan.
```

## Bitte jetzt

1. Erst die oben genannten Dateien aus GitHub/dev lesen.
2. Danach kurzen Plan fuer RDAP106 nennen.
3. Auf explizites `go` warten.
