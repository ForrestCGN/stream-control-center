# Files

## 0.2.27B Code-/Doku-Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/media-readonly.routes.js
backend/modules/remote_agent.js
backend/modules/local_remote_modboard_adapter.js
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/NEXT_CHAT_COPY_PROMPT_0.2.27B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Wichtig fuer Tests

```text
GET /api/remote/media/status
GET /api/remote/agent/status
GET /api/remote/agent/media/inventory/status
GET /api/remote-agent/media/inventory/status
```

## Standard-Arbeitsweise Zusatz

```text
Bei abgeschnittenem GitHub/dev-Kontext:
- lokale Source-Dateien per Sammel-Script zippen
- Source-ZIP hochladen
- daraus echten Install-Step-ZIP bauen

Bei Server-/API-Checks:
- gekuerzte jq-/PowerShell-Ausgaben verwenden
- volle JSON-Ausgaben nur bei Fehlerdiagnose
```
