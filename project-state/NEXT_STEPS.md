# NEXT STEPS

Stand: RDAP4C2_DASHBOARD_V2_REMOTE_AGENT_ADMIN_SPLIT_TESTED  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
RDAP5_REMOTE_AUTH_USER_MODEL_PLAN
```

## Ziel von RDAP5

RDAP5 soll **nur planen**, wie Remote-Modboard/Login/User/Rollen/Grants später sauber umgesetzt werden.

Noch keine Umsetzung.

Zu klären/planen:

- Login-Modell für `https://mods.forrestcgn.de`
- lokale Dashboard-User
- lokale Dashboard-Rollen
- konkrete Permission-Grants
- Verhältnis Twitch-Rollen zu lokalen Dashboard-Rechten
- Owner/Admin/Mod/Sound-Profi/Readonly
- sichere Session-/Token-Regeln
- Agent-Secret-Verwaltung, aber niemals im Frontend
- serverseitige Permission-Checks
- Audit-Pflicht für Login, Permission-Check, Lock und produktive Aktionen
- spätere DB-Struktur/Migration nur als separater Plan

## Vor RDAP5 prüfen

Zuerst echte aktuelle Dateien aus Repo/Live prüfen, insbesondere:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/FILES.md
backend/modules/remote_agent.js
backend/modules/helpers/helper_security.js
backend/modules/helpers/helper_routes.js
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_state.js
backend/core/security.js
backend/core/config.js
backend/core/paths.js
```

Falls Dateien fehlen oder anders heißen: exakt anfordern, nicht raten.

## RDAP5 darf

- Architektur und Datenmodell planen
- vorhandene Security-/Config-/Route-/State-Helper prüfen
- DB-Migrationsbedarf nur beschreiben
- Rollen-/Permission-/Grant-Modell konkretisieren
- Lock-/Audit-Anforderungen für spätere Schreibfunktionen konkretisieren
- klare Abgrenzung Webserver vs. Stream-PC-Agent festlegen

## RDAP5 darf nicht

- keine DB-Migration umsetzen
- keine produktive SQLite ändern
- kein Login improvisieren
- keine Schreibbuttons einbauen
- keine produktiven Aktionen auslösen
- keine Agent-Actions produktiv schalten
- keine OBS-/Sound-/Overlay-Steuerung
- keine Commands/Kanalpunkte produktiv bearbeiten
- keine SQLite ersetzen oder zurücksetzen
- kein neues Modul ohne zwingenden Grund
- keine Secrets ins Repo oder Frontend schreiben

## Alternative, falls erst UI/Lesbarkeit geglättet werden soll

```text
DASHV2_ADMIN_SECURITY_VIEW_POLISH
```

Ziel:

- Admin-Security-Seiten lesbarer machen.
- Lange Presets einklappen oder kompakter darstellen.
- Keine neue Funktion.
- Keine API-/Backend-/DB-Änderung.

## Spätere mögliche Schritte

```text
RDAP4D_PERMISSION_LOCK_DB_PLAN
```

für konkrete DB-Planung zu Permissions, Locks und Audit, aber erst nach Sichtung bestehender DB-/Helper-Patterns und separatem Go.

```text
RDAP6_MINIMAL_REMOTE_AUTH_IMPLEMENTATION
```

erst nach RDAP5-Plan, konkreter Datei-/DB-Prüfung und separatem Go.
