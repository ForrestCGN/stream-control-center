# RDAP DASHBOARD2 - Auth-Gate und CGN Design

Stand: RDAP_DASHBOARD2_AUTH_GATE_AND_CGN_DESIGN
Datum: 2026-06-24

## Ziel

Dashboard2 ersetzt den Diagnose-Prototyp durch einen saubereren Flow:

```text
Nicht eingeloggt -> Login-Seite
Eingeloggt, aber nicht freigegeben -> Access-Denied
Eingeloggt und freigegeben -> Dashboard
```

## Zugriff

Der Backend-Endpunkt `/api/remote/auth/me` liefert jetzt:

```text
loggedIn
dashboardAccess
accessReason
roles
```

Die erste Allowlist kommt aus Env:

```text
DASHBOARD_ALLOWED_LOGINS
DASHBOARD_ALLOWED_USER_UIDS
DASHBOARD_DEFAULT_ROLE
```

Default für dieses Projekt:

```text
DASHBOARD_ALLOWED_LOGINS=forrestcgn
DASHBOARD_DEFAULT_ROLE=owner
```

## Design

- stärkere CGN-/Neon-Galaxy-Optik
- eigene Login-Seite
- Access-Denied-Seite
- Dashboard nur bei `dashboardAccess=true`
- ruhigere Sidebar
- weniger Diagnose-Prototyp-Gefühl

## Weiterhin nicht aktiv

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Migration
