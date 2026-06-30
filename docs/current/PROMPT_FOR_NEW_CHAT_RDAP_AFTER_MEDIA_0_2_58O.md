Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG ZUERST:
- Masterprompt lesen und anwenden.
- GitHub/dev ist Wahrheit.
- Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
- Keine ZIPs vor `go`.
- Keine Funktionalitaet entfernen.

Repository:
- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Lokaler Stream-PC / Dashboard / Agent: `http://127.0.0.1:8080`
- Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
- Remote-Modboard live: `https://mods.forrestcgn.de/`

Aktueller RDAP-Stand: `0.2.58O - Media Index Persistent Tombstone gated Plan dokumentiert`.

Bestaetigte Grundlage:

```text
0.2.58N - Media Index Diff Reliability Note Fix bestaetigt
statusApiVersion = rdap_media_index_diff_reliability_note_fix_058n.v1
routeBuild = RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX
readOnly = true
```

0.2.58N Ergebnis:

```text
Full-Sync-Compare-Snapshot ist vollstaendig; Missing-Diagnose ist trotz gekuerztem Compact-Agent-Snapshot read-only belastbar.
persistentMediaMissingCandidateCount = 0
tombstoneCandidateDiagnosticCount = 0
```

0.2.58O Entscheidung:

```text
Normale persistent geloeschte Media-Dateien duerfen spaeter nur ueber einen getrennten gated Tombstone-Flow behandelt werden.
0.2.58O ist nur Planung/Doku.
Kein DB-Write.
Kein Auto-Delete.
Kein Hard-Delete.
Kein physisches Loeschen.
Kein Online->Agent-Trigger.
```

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58O.md`
3. `docs/current/RDAP_0.2.58O_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PLAN.md`
4. `docs/current/RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX.md`
5. `project-state/CURRENT_STATUS.md`
6. `project-state/NEXT_STEPS.md`
7. `project-state/TODO.md`
8. `project-state/CHANGELOG.md`
9. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen, wenn RDAP weitergeht:
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `remote-modboard/backend/src/services/db.service.js`
- `remote-modboard/backend/src/services/admin-confirm-write.service.js`
- ggf. `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js` als Muster fuer gated local-only Cleanup

Naechster sinnvoller RDAP-Step:

```text
RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW
```

Ziel:
- Preview-Route fuer normale persistente Missing/Tombstone-Kandidaten bauen.
- Nur read-only Preview.
- Kein Execute-Write in diesem Step, ausser Forrest gibt explizit einen separaten Write-Scope frei.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

Wichtig:
- TTS-generated war ein Sonderfall und ist bereinigt.
- Normale persistente Media-Dateien duerfen nicht blind geloescht werden.
- Spaeterer Tombstone/Delete nur mit eigenem Gate-/Confirm-/Audit-/Lock-/Backup-/Readback-Step.
- Alert-Arbeiten nicht mit RDAP vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
