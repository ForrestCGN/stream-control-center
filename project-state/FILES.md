# Files

## 0.2.32 relevante Dateien

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_0.2.32_MEDIA_PERSISTENT_INDEX_FOUNDATION_PLAN_NO_CODE.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## 0.2.32 bewusst nicht geaendert

```text
Keine Runtime-Dateien.
Keine Backend-Routen.
Keine UI-JS-Dateien.
Keine DB-Migrationen.
Keine Agent-Dateien.
Keine neuen Runtime-Dateien.
```

## 8080 lokal relevante Dateien

```text
backend/modules/local_remote_modboard_adapter.js
backend/modules/remote_agent.js
backend/core/database.js
backend/modules/sqlite_core.js
```

## 3010 Server/RDAP relevante Dateien

```text
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/app.js
remote-modboard/backend/server.js
```

## Fuer spaeteren Persistent-Index-Code-Step relevant

```text
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/media-readonly.routes.js
backend/core/database.js
backend/modules/sqlite_core.js
backend/modules/remote_agent.js
backend/modules/local_remote_modboard_adapter.js
remote-modboard/backend/src/**/*.js mit DB-/Storage-/Audit-Helpern
docs/current/RDAP_0.2.32_MEDIA_PERSISTENT_INDEX_FOUNDATION_PLAN_NO_CODE.md
docs/current/MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN_0.2.29.md
```

## Fuer separaten UI/i18n-Fix relevant

```text
remote-modboard/backend/public/assets/runtime-profile.js
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/modules/*
remote-modboard/backend/public/assets/languages/*
htdocs/dashboard-v2/assets/*
```

Sichtbarer Befund:

```text
module.media.label
page.media.library.title
page.media.library.label
```

## Neue-Dateien-Regel

```text
Neue Runtime-Dateien sind verboten, ausser Forrest genehmigt sie ausdruecklich nach konkreter Begruendung.
Vorhandene Module/Services/Routes bevorzugen.
Keine Parallelstruktur bauen.
Eine neue Doku-Datei ist erlaubt.
Eine neue Runtime-Datei ist nicht erlaubt.
```

## Standard-Arbeitsweise

```text
Bei abgeschnittenem GitHub/dev zuerst Source-Sammel-Script und Source-ZIP nutzen.
Install-ZIP muss echte Repo-Zielpfade enthalten.
Check-Ausgaben kurz halten; volles JSON nur bei Diagnose.
```
