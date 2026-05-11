# PROJECT MODULE AND ROUTE MAP - STEP259 DeathCounter Update

DeathCounter V2 neue/aktualisierte Storage-Routen:

```text
GET/POST /api/deathcounter/v2/storage/backup
GET/POST /api/deathcounter/v2/storage/export
```

Bestehende DeathCounter Storage-Routen bleiben erhalten:

```text
GET /api/deathcounter/v2/storage/preview
GET /api/deathcounter/v2/storage/validate
POST /api/deathcounter/v2/storage/import
GET /api/deathcounter/v2/storage/consistency
GET /api/deathcounter/v2/storage/read-test
```

Produktiver Storage:

```text
activeStorage: database
json backup/export only
```

Command-Erweiterung:

```text
!dcount backup
!dcount export
```
