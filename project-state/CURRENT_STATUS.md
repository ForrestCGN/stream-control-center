# Current Status

Stand: 2026-06-28

Aktueller getesteter Stand:

```text
0.2.14C - OBS read-only Online-Status-Fix
```

## Ergebnis

0.2.14C korrigiert den Mischstand nach 0.2.14B:

```text
Frontend/UI war bereits neu genug und zeigte OBS.
Online-Backend-Status und Routes kannten OBS aber noch nicht.
```

Jetzt ist online geprueft:

```text
/api/remote/status
- version: 0.2.14C
- stepRef: RDAP_0.2.14C_OBS_READONLY_ONLINE_STATUS_FIX
- moduleBuild: RDAP_0.2.14C_OBS_READONLY_ONLINE_STATUS_FIX
- obsPage vorhanden

/api/remote/local-dashboard/obs/status
- module: remote_obs_readonly
- moduleVersion: 0.2.14C
- statusApiVersion: rdap_obs_readonly_online_status_0214c.v1
- readOnly: true
- status: readonly_online_placeholder
- noObsRequestSent: true
- noAgentActionExecution: true

/api/remote/routes
- /api/remote/local-dashboard/obs/status vorhanden
- /api/remote/local-dashboard/obs/model vorhanden
```

OBS bleibt sichtbar und read-only.

## Nicht geaendert

- keine grosse Navigation neu gebaut,
- OBS bleibt aktuell am bestehenden Platz,
- keine DB-Migration,
- keine produktiven Writes,
- keine Agent-Actions,
- keine OBS-WebSocket-Kommandos durch das Online-Backend,
- kein Szenenwechsel,
- kein Mute/Unmute,
- keine Quellen-Sichtbarkeit,
- keine Media-Steuerung,
- keine Shell-/Datei-/Prozess-Actions.
