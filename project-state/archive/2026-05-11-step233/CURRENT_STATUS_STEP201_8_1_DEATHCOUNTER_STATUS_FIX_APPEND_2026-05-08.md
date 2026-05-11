# STEP201.8.1 Append – Deathcounter V2 Status-Fix

Deathcounter V2 Status-Endpunkt wurde stabilisiert.

Geändert:

```text
GET /api/deathcounter/v2/status
```

Der Endpunkt nutzt jetzt einen sicheren Project-Root-Fallback.
Keine Runtime-/Counter-/Overlay-Logik wurde geändert.
