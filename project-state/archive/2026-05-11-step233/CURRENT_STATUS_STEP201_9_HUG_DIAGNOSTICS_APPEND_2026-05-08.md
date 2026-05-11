# STEP201.9 Append – Hug/Rehug Diagnose-Endpunkte

Hug/Rehug wurde auf den STEP201-Diagnose-Standard ergänzt.

Produktiver Prefix:

```text
/api/hug
```

Ergänzt:

```text
/config
/settings
/routes
/integration-check
POST /reload
```

`/api/rehug` bleibt bewusst kein eigener Modul-Prefix. Rehug bleibt fachlich Teil von `/api/hug`.

Keine Hug-/Rehug-Command-, Textpaar-, Stats-, Toplisten- oder Dashboard-Logik wurde geändert.
