# MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26

## Aktualisiert in STEP491

- `docs/modules/channelpoints-deep-dive.md`
- `docs/modules/README.md`

## Aktueller Stand

- STEP489 Kanalpunkte-Backend-Skeleton dokumentiert.
- STEP490 Kanalpunkte-Modell und Media-Plan dokumentiert.
- STEP491 Kanalpunkte-Schema-Preview dokumentiert.

## Wichtige Architekturhinweise

- Kanalpunkte ist ein neues Fachmodul, keine Parallelwelt fuer Media/Uploads.
- Medien muessen ueber das bestehende Media-System laufen.
- DB-Migrationen duerfen nur additiv erfolgen und erst nach explizitem Go.
- Twitch-Rewards duerfen erst in spaeteren Schritten geschrieben/geaendert werden.

## Naechster Doku-Fokus

Nach STEP492 muss dokumentiert werden:

```text
- echte Tabellen
- echte Schema-Version
- Statusroute mit DB-Counts
- Rollback-/Safety-Hinweise
```
