# Prompt for new chat after RDAP Media 0.2.71

Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Repository:

- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Webserver-Pfad: `/opt/stream-control-center`

Verbindlicher Workflow:

1. Erst GitHub/dev und relevante Dateien wirklich lesen.
2. Dann kurzen Plan nennen.
3. Auf `go` warten.
4. Erst dann ZIP bauen.
5. ZIP muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
6. Keine Patch-/Apply-Skripte.
7. Lokale Checks, dann `stepdone.cmd`.

Aktueller Stand:

```text
0.2.71 - Media Index Remote-Agent Media-System Scan Code Prep
```

0.2.71 hat neu angelegt:

```text
backend/modules/helpers/helper_media_inventory_roots.js
```

Zweck:

- Side-effect-free Helper fuer Media-System- und Legacy-Root-Metadaten.
- Neues Media-System: `assets/media/<module>/<category>/...`.
- Legacy bleibt: `assets/sounds`, `assets/videos`, `assets/images`.
- Kategorien/Module sollen spaeter im Remote-Agent Inventory fuer Dashboard/Remote-Modboard-Sortierung mitkommen.

0.2.71 hat NICHT getan:

```text
keine Aenderung an remote_agent.js Runtime-Wiring
keine Testdatei
keine lokale Dateiaktion
keine DB-Aenderung
keine Migration
keine Gates
kein Execute
kein Webserver-Deploy
```

Naechster sinnvoller Block:

```text
RDAP_0.2.72_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_WIRING
```

Ziel:

- `backend/modules/remote_agent.js` minimal auf Helper verdrahten.
- `assets/media/<module>/<category>` zusaetzlich scannen.
- Legacy-Roots weiter read-only behalten.
- Inventory-Items um `source`, `moduleKey`, `categoryKey`, `fullCategoryKey`, `assetRelativePath`, `webPath/publicPath` ergaenzen.
- Keine Testdatei, keine DB, keine Gates, kein Execute.
