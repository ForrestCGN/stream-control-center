# STEP201.10b Append – OBS Diagnose-Endpunkte

OBS wurde als Infrastrukturmodul unter `/api/obs` um Diagnose-Endpunkte ergänzt.

Ergänzt:

```text
/config
/settings
/routes
/integration-check
/reload
```

Bestehende `/api/obs/status`-Route bleibt unverändert.
Legacy `/obs/...` bleibt unverändert.
