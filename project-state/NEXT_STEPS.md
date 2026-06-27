# Next Steps

Stand: 2026-06-27

Naechster sinnvoller technischer Schritt:

```text
RDAP127_LOCAL_DASHBOARD_MODULE_SHELL_IMPLEMENTATION_READONLY
```

Ziel:

1. Echte Dateien aus GitHub/dev lesen.
2. Bestehende Modulregistrierungsregeln anwenden.
3. `local-dashboard` im Modulmanifest technisch anlegen.
4. Erste lokale read-only Seiten implementieren:
   - `stream-pc-status`,
   - `lan-connections`,
   - `local-runtime-help`.
5. Runtime-Scope `local` sauber verwenden.
6. Sprachdateien `de.js` und `en.js` ergaenzen.
7. Minimale Page-Scripte unter `remote-modboard/backend/public/assets/modules/local-dashboard/` erstellen.
8. Keine Actions aktivieren.
9. Keine DB-Migration.
10. Keine neuen produktiven Writes.

Vor Umsetzung relevante Dateien lesen:

```text
docs/current/MODULE_REGISTRATION_RULES_CURRENT.md
docs/current/LOCAL_DASHBOARD_MODULE_SHELL_PLAN_CURRENT.md
remote-modboard/backend/public/assets/modules/module-manifest.js
remote-modboard/backend/public/assets/languages/de.js
remote-modboard/backend/public/assets/languages/en.js
remote-modboard/backend/public/assets/runtime-profile.js
remote-modboard/backend/public/assets/remote-modboard.js
```

Danach Plan nennen und auf `go` warten.
