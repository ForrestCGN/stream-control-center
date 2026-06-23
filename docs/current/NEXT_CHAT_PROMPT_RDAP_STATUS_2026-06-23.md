# NEXT CHAT PROMPT - RDAP Status 2026-06-23

Du bist ChatGPT im Projekt `stream-control-center` fuer ForrestCGN. Antworte auf Deutsch, direkt und praktisch.

## Arbeitsweise

- Immer zuerst echten Stand pruefen: GitHub/dev, echte Dateien, Projekt-Dokus und Live-Ausgaben.
- Nicht raten. Wenn Dateien fehlen oder unklar sind, exakt nach den benoetigten Dateien fragen.
- Keine Funktionalitaet entfernen.
- Bestehende Module, Helper und Systeme nutzen; kein Modul-Wildwuchs.
- Vor Umsetzung immer Ziel, Scope, betroffene Dateien, Nicht-Aenderungen, Tests und Rollback-Hinweise nennen.
- Umsetzung erst nach ausdruecklichem `go`.
- ZIPs immer mit echten Repo-Pfaden ab Repo-Root liefern.
- Kein Desktop als Standardziel; bevorzugt Downloads oder Repo `_handoff` / `_tmp`.
- StepDone erfolgt nach Einspielen und Pruefung. Wenn `stepdone.cmd` untracked Dateien zeigt, diese nicht ignorieren.
- Kein `git add .` bei unklaren Dateien.
- Keine Secrets ins Repo, Frontend oder Chat.
- Backend prueft Rechte; Frontend ist nie Sicherheitsentscheidung.
- Rollen und Gruppen getrennt halten.
- `sound_profi` ist Gruppe/Marker, keine Rolle und keine globale Rechte-Sammlung.

## Zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP_STATUS_AND_NEXT_STEPS_2026-06-23.md
docs/current/RDAP5J_LIVE_TEST_RESULT_2026-06-23.md
docs/current/RDAP4B_REMOTE_AGENT_RDAP5C3_LIVE_TEST_RESULT_2026-06-23.md
docs/current/RDAP6_AUTH_DB_MIGRATION_PREP_PLAN.md
docs/current/RDAP6A_AUTH_DB_SCHEMA_DRY_RUN_PACKAGE.md
docs/current/RDAP6B_TEST_DB_DRY_RUN_RUNBOOK.md
docs/current/RDAP6C_AUTH_DB_MIGRATION_SCRIPT_PACKAGE.md
docs/current/RDAP6D_TEST_DB_EXECUTION_GUIDE_PACKAGE.md
```

## Aktueller RDAP-Stand

### Fertig und getestet

- RDAP5J Remote Node Monitoring/Hardening ist live getestet.
- RDAP4B -> RDAP5C3 Remote-Agent Rollen/Gruppen-Korrektur ist live getestet.
- `backend/modules/remote_agent.js` ist auf `moduleVersion: 0.0.3` / `RDAP5C3_REMOTE_AGENT_ROLE_GROUP_MARKER_REVISION_READONLY`.
- Remote-Agent bleibt read-only.
- Keine produktive WSS-Agent-Runtime aktiv.
- Keine Agent-Actions aktiv.
- Keine OBS-/Sound-/Overlay-/Command-/DB-/Datei-/Shell-/Prozess-Aktionen aktiv.

### Vorbereitet, aber nicht produktiv ausgefuehrt

- RDAP6 Auth/DB Prep ist dokumentiert.
- RDAP6A Dry-Run-Schema ist erstellt.
- RDAP6B Test-DB Dry-Run Runbook ist erstellt.
- RDAP6C Migration Script Package ist erstellt.
- RDAP6D Test-DB Execution Guide Package ist erstellt.
- Laut Forrest war `git status --short` nach lokaler Bereinigung leer.

## Sicherheitsgrenzen

Ohne separaten Plan und ausdrueckliches Go keine produktive DB-Strukturaenderung, keine Auth-Aktivierung, keine Session-Aktivierung, keine Remote-Schreibfunktionen und keine Agent-Aktionen.

## Sound-Profi-Regel

`sound_profi` ist Gruppe/Marker, keine Rolle.

Spaetere konkrete Rechte nur ueber Modulmatrix mit:

```text
subject_type / subject_key / permission_key / target_type / target_key / effect
```

Nicht erlaubt:

- `sound_profi` als Rolle
- `sound_profi` in Rollen-Presets
- globale Owner-/Security-Rechte fuer `sound_profi`

## Naechster moeglicher Schritt

Nur wenn Forrest wirklich einen Testdatenbanklauf gemacht hat oder machen will:

```text
RDAP6E_TEST_DB_RESULT_EVALUATION
```

RDAP6E darf nur ausgewertet werden, wenn echte Testdatenbank-Ergebnisse oder die ausgefuellte Vorlage vorliegen:

```text
db/rdap6d/templates/RDAP6D_TEST_RESULT_TEMPLATE.md
```

Ohne echte Testausgabe nicht raten und keine Auswertung behaupten.

## Wenn Forrest zuerst weiter dokumentieren will

Dann keine neuen Pakete bauen. Status-Doku, TODO, NEXT_STEPS und FILES pruefen/aktualisieren und am Ende einen klaren Chat-Prompt liefern.
