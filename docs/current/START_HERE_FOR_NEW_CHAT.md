# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard

Stand: RDAP_DASHBOARD2_AUTH_GATE_AND_CGN_DESIGN
Datum: 2026-06-24

## Aktueller Fokus

```text
RDAP_DASHBOARD2_AUTH_GATE_AND_CGN_DESIGN
```

## Flow

```text
Nicht eingeloggt -> Login-Seite
Eingeloggt, aber nicht freigegeben -> Access-Denied
Eingeloggt und freigegeben -> Dashboard
```

## Env-Allowlist

```text
DASHBOARD_ALLOWED_LOGINS=forrestcgn
DASHBOARD_ALLOWED_USER_UIDS=
DASHBOARD_DEFAULT_ROLE=owner
```

## Weiterhin verboten

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets ins Repo/Frontend/Chat/Logs
