# Neuer Chat Prompt — RDAP nach RDAP30

Wir arbeiten am Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Repository:

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Webserver: mods.forrestcgn.de
Webserver-Live-Pfad: /opt/stream-control-center/remote-modboard
Service: scc-remote-modboard.service
```

Bitte zuerst diese Dateien aus GitHub/dev lesen:

```text
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-24.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP29B_ADMIN_NOTE_MARIADB_SEED_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Wichtige Arbeitsweise:

```text
Steps so gross wie moeglich und so klein wie noetig.
Keine kuenstlichen Mini-Schritte.
Bei "go" den naechsten sinnvollen Step bauen oder ausfuehren, nicht denselben Plan endlos wiederholen.
Befehlskloetze nur dann erneut zeigen, wenn sie neu oder wirklich noetig sind.
Wenn Stepdone gemeldet wurde: lokalen Stand als erledigt behandeln.
Wenn Doku-only: kein Webserver-Deploy.
Wenn Backend/UI-Step: nach stepdone Webserver-Deploy aus frischem GitHub/dev-Clone.
Fehlende Dateien gezielt anfragen, nicht raten.
ZIPs immer mit echten Zielpfaden bauen, ohne unnoetige Root-README-Dateien.
Keine Funktionalitaet entfernen.
Keine Workflow-Tools ueberschreiben.
```

Aktueller Stand:

```text
RDAP25 Login/OAuth/Session funktioniert.
RDAP26 Option B DB-Rollen/Permissions funktioniert.
RDAP27 echte read-only Admin-Notiztext-Route ist live.
RDAP28 read-only Admin-Notiz-UI ist live.
RDAP29/RDAP29B MariaDB-Testnotiz ist live und read-only sichtbar.
RDAP30 Write-Scope ist geplant, aber noch nicht gebaut.
```

Live-DB-Befund:

```text
Live-DB: MariaDB 11.8.6
DB-Name: c3stream_control
Tabelle: dashboard_user_admin_notes
ForrestCGN user_uid: tw:127709954
Testnotiz: rdap29-test-note-forrestcgn-readonly-validation
Notizen: 1 active
```

Weiterhin nicht aktiv:

```text
Admin-Notiz schreiben
Admin-Notiz aendern
Admin-Notiz loeschen
Permission admin.users.note.write
UI-Schreibbuttons
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Community-Seiten-Anbindung fuer Admin-Notizen
```

RDAP30-Entscheidung:

```text
Erster Write-Scope soll nur create / update note_text / deactivate enthalten.
Kein physisches DELETE.
UI-Schreibbuttons erst nach sicherem Backend-Test.
```

Naechste sinnvolle Entscheidung:

```text
A) RDAP31_ADMIN_NOTE_WRITE_BACKEND_CREATE_UPDATE_DEACTIVATE_DISABLED_UI
   Backend-Write-Routen vorbereiten/bauen, aber UI-Schreibbuttons weiterhin nicht sichtbar.
   Test nur per Curl und nur mit confirmWrite=true.

B) RDAP31_ADMIN_NOTE_WRITE_BACKEND_DETAILED_PLAN_ONLY
   Noch detaillierter planen, falls Audit-/Lock-Write-Basis unklar ist.
```

Empfehlung: A, aber nur wenn Audit-/Lock-Write-Anbindung anhand echter Dateien geprueft wurde. Wenn Lock/Audit aktuell nur Diagnose/Read-only ist, muss RDAP31 entweder diese Writes sauber anbinden oder die produktive Admin-Notiz-Write-Funktion blockiert lassen.
