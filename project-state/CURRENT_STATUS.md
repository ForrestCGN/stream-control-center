# CURRENT STATUS - stream-control-center

Stand: 2026-05-09

## Loyalty Dashboard

STEP203.5.1 korrigiert den Konfig-Tab.

Problem war rein im Frontend:

```text
/api/loyalty/settings liefert settings: [...]
```

Das Dashboard konnte direkte Arrays bisher nicht als Row-Liste lesen.

Geändert:

```text
htdocs/dashboard/modules/loyalty.js
```

Backend, DB und API bleiben unverändert.
