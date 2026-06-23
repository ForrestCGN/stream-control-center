# NEXT STEPS

Stand: RDAP5B_AUTH_DB_SCHEMA_PLAN_DOCUMENTED  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
RDAP5C_AUTH_DB_MIGRATION_DESIGN
```

## Ziel von RDAP5C

RDAP5C soll planen, wie die in RDAP5B beschriebenen Tabellen spaeter sicher in der Webserver-DB angelegt werden.

Noch keine Ausfuehrung.

Zu klaeren/planen:

- Wo laeuft spaeter Node fuer `mods.forrestcgn.de`?
- Wie bekommt Node sicheren Zugriff auf `c1stream_control`?
- Wo liegen DB-Secrets sicher?
- Welcher DB-Treiber wird fuer MySQL/MariaDB genutzt?
- Wie werden Migrationen versioniert?
- Wie wird vor Migration gesichert?
- Wie wird Migration idempotent?
- Wie wird Rollback dokumentiert?
- Wie werden Seeds fuer Rollen/Permissions sauber eingespielt?
- Wie bleibt lokale SQLite unangetastet?

## Vor RDAP5C prüfen

Zuerst echte aktuelle Dateien aus Repo/Live prüfen, insbesondere:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/REMOTE_DASHBOARD_RDAP5B_AUTH_DB_SCHEMA_PLAN.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/FILES.md
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_security.js
backend/core/security.js
backend/core/paths.js
package.json
```

Zusätzlich klaeren:

```text
gibt es auf dem Webserver bereits Node?
welche Node-Version?
wo soll das Remote-Modboard laufen?
wie werden ENV/Secrets dort gespeichert?
```

## RDAP5C darf

- Migration-/Helper-Design planen
- DB-Treiber vorschlagen
- Secret-/ENV-Strategie planen
- Seeds fuer Rollen/Permissions planen
- Backup-/Rollback-Regeln planen
- Install-/Testablauf planen

## RDAP5C darf nicht

- keine DB-Migration ausfuehren
- keine produktive SQLite ändern
- keine MariaDB schreiben
- kein Login-Code bauen
- keine Schreibbuttons einbauen
- keine produktiven Aktionen auslösen
- keine Agent-Actions produktiv schalten
- keine Secrets ins Repo oder Frontend schreiben

## Spätere mögliche Schritte

```text
RDAP5D_AUTH_DB_MIGRATION_DRYRUN
```

Nur wenn Zugriff/Secrets/Backup geklaert sind.

```text
RDAP6_MINIMAL_REMOTE_AUTH_IMPLEMENTATION
```

Erst nach DB-Migrationsdesign, echter Datei-/DB-Pruefung und separatem Go.
