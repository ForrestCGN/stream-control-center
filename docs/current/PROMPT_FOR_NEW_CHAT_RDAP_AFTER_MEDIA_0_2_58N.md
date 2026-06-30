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

Aktueller RDAP-Stand: `0.2.58N - Media Index Diff Reliability Note Fix`.

Bestaetigte fachliche Entscheidung:

```text
TTS-generated Dateien unter sounds/tts/generated/** sind temporaer und werden nicht dauerhaft synchronisiert.
Normale persistente Media-Dateien duerfen nicht blind geloescht werden.
Tombstone/Delete fuer persistente Media-Dateien nur spaeter mit eigenem Gate-/Confirm-/Audit-/Lock-/Backup-/Readback-Step.
```

Bestaetigte 0.2.58L-Umsetzung:

```text
Alter TTS-generated Legacy-DB-Eintrag wurde per gated Soft-Delete bereinigt.
Kein Hard-Delete.
Kein physisches Loeschen.
Keine normalen persistenten Media-Dateien betroffen.
Kein Online->Agent-Trigger.
```

Bestaetigte 0.2.58M-Umsetzung:

```text
Read-only Tombstone-Plan fuer normale persistent geloeschte Media-Dateien dokumentiert.
Kein Code.
Kein DB-Write.
Kein physisches Loeschen.
```

0.2.58N-Umsetzung:

```text
Reliability-Note der Media-Index-Diff-Route korrigiert.
Wenn Full-Sync-Compare vollstaendig und missingOnAgentReliable=true ist, dominiert nicht mehr die Warnung des gekuerzten Compact-Agent-Snapshots.
```

Statusmarker:

```text
rdap_media_index_diff_reliability_note_fix_058n.v1
RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX
```

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58N.md`
3. `docs/current/RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX.md`
4. `docs/current/RDAP_0.2.58M_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_PLAN_READONLY.md`
5. `docs/current/RDAP_0.2.58L_FINAL_STATUS_AFTER_TTS_LEGACY_CLEANUP_CONFIRMED.md`
6. `project-state/CURRENT_STATUS.md`
7. `project-state/NEXT_STEPS.md`
8. `project-state/TODO.md`
9. `project-state/CHANGELOG.md`
10. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen, wenn RDAP weitergeht:
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `backend/modules/remote_agent.js`

Naechster sinnvoller RDAP-Step:

```text
Tombstone-Gate/Confirm/Audit/Lock/Readback fuer persistente Media-Dateien separat planen, aber nur wenn es echte persistentMediaMissingCandidateCount > 0 gibt oder Forrest den Flow vorbereiten will.
```

Wichtig:
- Kein Auto-Delete.
- Kein DB-Write ohne eigenen freigegebenen Write-Step.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
- Alert-Arbeiten nicht mit RDAP vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
