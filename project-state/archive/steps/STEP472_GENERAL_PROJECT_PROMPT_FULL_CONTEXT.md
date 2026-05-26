# STEP472_GENERAL_PROJECT_PROMPT_FULL_CONTEXT

## Ziel

Den allgemeinen Projektprompt so erweitern, dass er als vollständige Arbeitsgrundlage für neue Chats genutzt werden kann.

Der Prompt soll enthalten:

- Arbeitsweisen
- Regeln
- wichtige Pfade
- wichtige GitHub-Dateien
- wichtige Helper
- wichtige Routen
- Dashboard-Regeln
- DB-Regeln
- EventBus-/Sound-Regeln
- aktuelle Modulstände
- aktuelle nächste Schritte

## Geändert

```text
project-state/GENERAL_PROJECT_PROMPT.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

## Bewusst nicht geändert

```text
Keine Backend-Logik
Keine Dashboard-Logik
Keine Overlay-Logik
Keine Datenbank-Migration
Keine JavaScript-Dateien
Keine Config-Dateien
Keine Runtime-Funktion
```

## Tests

Da nur Markdown-Dateien geändert wurden:

```text
Kein node --check nötig.
```

Manuell prüfen:

```text
project-state/GENERAL_PROJECT_PROMPT.md öffnen und als neuen Chat-Prompt verwenden.
```

## Nächster sinnvoller Schritt

```text
STEP473_SHOUTOUT_DASHBOARD_TABS
```
