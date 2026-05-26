# STEP473_TODO_RULE_IN_GENERAL_PROMPT

## Ziel

Den allgemeinen Projektprompt um eine verbindliche ToDo-/Offene-Punkte-Regel erweitern und eine zentrale `project-state/TODO.md` anlegen.

## Geändert

```text
project-state/GENERAL_PROJECT_PROMPT.md
project-state/TODO.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP473_TODO_RULE_IN_GENERAL_PROMPT.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

## Was geändert wurde

- Der allgemeine Prompt enthält jetzt ausdrücklich die Pflicht, offene Punkte dauerhaft zu dokumentieren.
- Neue zentrale Datei `project-state/TODO.md` ergänzt.
- Zuständigkeit geklärt:
  - `TODO.md` für Backlog, spätere Ideen, verschobene Aufgaben, Bugs und Technik-/UX-Schulden.
  - `NEXT_STEPS.md` für unmittelbare nächste Einbau-, Prüf- und Testschritte.
- Aktuelle offene Punkte ergänzt:
  - Shoutout-Dashboard in Tabs/Unterbereiche aufteilen.
  - Eingehende Twitch-Shoutouts loggen und statistisch anzeigen.
  - Stream-Status bei echtem Streamstart/Ende testen.
  - Weitere Module auf zentralen Stream-Status umstellen.

## Bewusst nicht geändert

```text
Keine Backend-Logik
Keine Dashboard-Logik
Keine Overlay-Logik
Keine JavaScript-Dateien
Keine Datenbank-Migration
Keine Config-Dateien
```

## Tests

Da nur Markdown-Dateien geändert wurden, ist kein `node --check` nötig.

## Abschluss

```bat
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP473 Todo Rule in General Prompt"
```
