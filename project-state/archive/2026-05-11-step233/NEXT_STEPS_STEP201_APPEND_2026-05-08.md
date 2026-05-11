# NEXT_STEPS Ergänzung – nach STEP201

Stand: 2026-05-08

## Nächste Schritte

### STEP201.1 – API-Prefix-/Alias-Entscheidung

Klären:

```text
Welche Module haben alte/abweichende Prefixe?
Welche neuen Alias-Routen sollen ergänzt werden?
Welche alten Routen bleiben zwingend erhalten?
```

### STEP201.2 – /routes-Endpunkte nachziehen

Priorität:

```text
alerts
soundalerts
tagebuch
todo
messages
message_rotator
vip
```

### STEP201.3 – /integration-check-Endpunkte nachziehen

Priorität:

```text
soundalerts
tagebuch
todo
messages
message_rotator
vip
```

### STEP201.4 – Settings-/Config-Quellen dokumentieren

Pro Modul:

```text
DB-Tabellen
JSON-Fallbacks
ENV/Secrets
Dashboard-API
Text-System
```
