# Next Steps

Stand: 2026-06-27

Naechster sinnvoller technischer Schritt:

```text
RDAP126_LOCAL_DASHBOARD_MODULE_SHELL_PLAN
```

Ziel:

1. Echte Dateien aus GitHub/dev lesen.
2. Bestehende Modulregistrierungsregeln anwenden.
3. Lokalen Dashboard-Hauptbereich im Modulmanifest planen.
4. Erste lokale read-only Seiten definieren, z. B.:
   - lokaler Stream-PC Status,
   - lokale Verbindungsuebersicht,
   - lokale Betriebs-/Env-Hinweise.
5. Runtime-Scope `local`/`both` sauber verwenden.
6. Keine Actions aktivieren.
7. Keine DB-Migration.
8. Keine neuen produktiven Writes.

Vor Umsetzung relevante Dateien lesen:

```text
docs/current/MODULE_REGISTRATION_RULES_CURRENT.md
docs/current/LOCAL_STREAM_PC_ENV_START_PROFILE_CURRENT.md
remote-modboard/backend/public/assets/modules/module-manifest.js
remote-modboard/backend/public/assets/languages/de.js
remote-modboard/backend/public/assets/languages/en.js
remote-modboard/backend/public/assets/runtime-profile.js
remote-modboard/backend/public/assets/remote-modboard.js
```

Danach Plan nennen und auf `go` warten.
