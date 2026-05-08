# STEP201.9 – Hug/Rehug Diagnose-Status

Hug/Rehug nutzt produktiv `/api/hug`.

## Standard-Endpunkte

```text
GET  /api/hug/status
GET  /api/hug/config
GET  /api/hug/settings
GET  /api/hug/routes
GET  /api/hug/integration-check
POST /api/hug/reload
```

## Alias-Entscheidung

Keine neuen Alias-Prefixe:

```text
/api/rehug
/api/hug-system
/api/hugs
```

Rehug bleibt fachlich Teil des Hug-Moduls.

## Sicherheit

Keine Hug-/Rehug-Command-Logik wurde geändert.
Keine Textpaar-Kopplung wurde geändert.
Keine Stats oder Toplisten wurden geändert.
`POST /api/hug/reload` ist nicht-destruktiv und triggert keine Chat-Ausgabe.
