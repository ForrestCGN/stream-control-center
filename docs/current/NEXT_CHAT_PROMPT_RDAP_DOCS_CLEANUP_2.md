# NEXT CHAT PROMPT - RDAP Docs Cleanup 2

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wichtig

GitHub/dev und das lokale Repo sind Wahrheit. Nicht main verwenden.

Arbeitsbasis:

```text
GitHub: ForrestCGN/stream-control-center
Branch: dev
Lokal: D:\Git\stream-control-center
```

Forrest arbeitet lokal. Der Chat erstellt nur ZIPs mit echten Repo-Zielpfaden. Forrest legt ZIPs in den Downloads-Ordner und spielt sie mit `installstep.cmd` aus dem lokalen Repo ein.

## Verbindliche Arbeitsweise

1. Erst echte Dateien aus GitHub/dev lesen.
2. Relevante Startdateien lesen:
   - `docs/current/START_HERE_FOR_NEW_CHAT.md`
   - `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`
   - `docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md`
   - `docs/current/MODULE_INVENTORY_CURRENT.md`
   - `docs/current/ROUTE_SERVICE_INVENTORY_CURRENT.md`
   - `docs/current/DOCS_AND_STATS_CLEANUP_AUDIT.md`
   - `project-state/CURRENT_STATUS.md`
   - `project-state/NEXT_STEPS.md`
   - `project-state/TODO.md`
   - `project-state/FILES.md`
   - `project-state/CHANGELOG.md`
3. Danach Plan nennen.
4. Auf Forrests ausdrueckliches `go` warten.
5. Keine Funktionalitaet entfernen.
6. Keine parallelen Systeme bauen.
7. Neue Dateien nur, wenn fachlich noetig.
8. ZIPs muessen echte Repo-Zielpfade enthalten.
9. Keine Webserver-Deploys fuer Doku-only/Cleanup-only ohne Runtime-Code.

## Aktueller Stand

`RDAP_DOCS_CLEANUP_1_DEV_MODULE_STATS_INVENTORY` hat zentrale Inventar-/Audit-Doku vorbereitet:

```text
docs/current/MODULE_INVENTORY_CURRENT.md
docs/current/ROUTE_SERVICE_INVENTORY_CURRENT.md
docs/current/DOCS_AND_STATS_CLEANUP_AUDIT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_2.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Naechster Step

Name:

```text
RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE
```

Ziel:

- sichere Backup-Dateien aus aktiven Runtime-Ordnern loeschen
- `htdocs/htdocs/...`-Verschachtelung pruefen und ggf. entfernen
- `project-state/` Root bereinigen
- Stats-/Reports-Dateien zusammenfuehren oder entfernen
- Doku gegen Modul-/Route-/Service-Inventar pruefen
- keine Feature-Codeaenderung
- keine DB
- kein Deploy bei Doku-only

Vor dem Bauen erneut echte Dateien aus GitHub/dev lesen und gegen die lokale Zielstruktur denken.
