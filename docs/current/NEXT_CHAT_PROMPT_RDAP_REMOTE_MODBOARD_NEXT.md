# NEXT CHAT PROMPT - RDAP / Remote-Modboard normale Weiterarbeit

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wahrheit / Arbeitsbasis

- GitHub/dev und lokales Repo `D:\Git\stream-control-center` sind Wahrheit.
- Nicht gegen GitHub/main arbeiten.
- Erst echte Dateien/Dokus lesen, dann Plan nennen, dann auf `go` warten.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber/nachvollziehbar: `stepdone.cmd`.
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only.
- Nutzerkommunikation mit Version und deutschem Buildnamen. Interne RDAP-Step-IDs nur fuer ZIP/Commit/Deploy verwenden.

## Pflicht-Startdateien wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/MODULE_REGISTRATION_RULES_CURRENT.md
docs/current/LOCAL_STREAM_PC_ENV_START_PROFILE_CURRENT.md
docs/current/LOCAL_DASHBOARD_MODULE_SHELL_PLAN_CURRENT.md
```

## Aktueller Stand

Aktueller sichtbarer Stand:

```text
0.2.5 - Lokales Dashboard vorbereitet
```

Umgesetzt:

- Hauptbereich `Lokales Dashboard` im zentralen Modulmanifest.
- Drei lokale read-only Seiten:
  - Stream-PC Status,
  - LAN / Zugriff,
  - Start / Env.
- Runtime-Scope `local` fuer diese Seiten.
- Sprachkeys Deutsch/Englisch.
- Status-API meldet lokale Dashboard-Seiten als vorbereitet.

## Was NICHT gemacht werden darf

- Kein GitHub/main.
- Keine Codeaenderung nebenbei.
- Keine DB-Migration ohne expliziten Scope.
- Keine Remote-Modboard-Writes ohne Confirm-Write, Permission, Audit, Lock, Backup, Rollback und Readback.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions.
- Keine aktiven Module entfernen.
- Keine Funktionen entfernen.

## Naechster sinnvoller Arbeitsfokus

Lokales Dashboard mit echten read-only Daten verbessern, ohne Actions zu aktivieren.

Vor jeder Umsetzung:

1. echte Dateien aus GitHub/dev lesen,
2. bestehende Module/Services/Routes bevorzugen,
3. keine parallelen Strukturen bauen,
4. Plan mit deutschem sichtbarem Buildnamen nennen,
5. auf Forrests explizites `go` warten.
