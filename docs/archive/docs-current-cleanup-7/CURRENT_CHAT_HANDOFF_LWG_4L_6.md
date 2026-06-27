# CURRENT CHAT HANDOFF – LWG-4L.6

## Stand

LWG-4L.5 bleibt gültige Codebasis (`STEP_LWG_4L_5`).

LWG-4L.6 ist ein reiner Kontroll-/Test-Step ohne Codeänderung. Ziel ist ein temporärer Aktivierungstest von `!ticket` über das zentrale `commands`-System.

## Ergebnisziel

- `!ticket` kann temporär über `/api/commands/upsert` aktiviert werden.
- Ohne offenes Giveaway muss `/api/commands/execute` über das Modul `giveaway_no_active` / `ticket.no_active` ergeben.
- Danach wird `!ticket` wieder deaktiviert.
- `!wheel` / `!rad` bleiben deaktiviert.

## Rollback

Rollback erfolgt über `/api/commands/upsert` mit `enabled=false` für `ticket`.
