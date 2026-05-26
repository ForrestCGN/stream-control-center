# STEP471 - Docs Rules and General Prompt

## Ziel

Doku, Projektregeln und allgemeinen Projektprompt aktualisieren, bevor weitere Shoutout-/Dashboard-Arbeiten umgesetzt werden.

## Betroffene Dateien

```text
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_WORKING_RULES.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/STEP471_DOCS_RULES_AND_GENERAL_PROMPT.md
```

## Geändert

- Zentrale Arbeitsregeln in einer eigenen Datei dokumentiert.
- Allgemeiner Projektprompt für neue Chats aktualisiert.
- Regel für kurze, kopierfreundliche Shell-/PowerShell-Ausgaben ergänzt.
- Standardabschluss nach ZIP präzisiert:
  - `node --check` nur für tatsächlich geänderte JS-Dateien
  - wenn keine JS-Dateien geändert wurden, kein `node --check`
- Aktuellen technischen Kontext dokumentiert:
  - `stream_status` 0.1.2
  - `clip_shoutout` 0.2.10
  - Shoutout-Dashboard vorhanden
  - nächster UX-Schritt: Tabs
  - späterer Ausbau: eingehende Shoutouts loggen

## Bewusst nicht geändert

- Keine Backend-Logik.
- Keine Dashboard-Logik.
- Keine Shoutout-Logik.
- Keine Stream-Status-Logik.
- Keine Datenbank-Migration.
- Keine Config-Änderung.
- Keine JavaScript-Datei.

## Tests

Da nur Markdown-Dokumentation geändert wurde:

- kein `node --check` nötig
- keine API-Tests nötig
- nach Entpacken prüfen, ob die Dateien vorhanden sind

## Einbau

```bat
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP471 Docs Rules and General Prompt"
```
