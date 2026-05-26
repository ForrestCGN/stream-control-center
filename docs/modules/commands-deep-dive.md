# Commands-System Deep Dive

Stand: 2026-05-26 / STEP496

## Zweck

Das Command-System verwaltet Chatbefehle, Kategorien/Katalogaktionen, Ausführung, Cooldowns, Permissions und Logs.

## Dashboard-Ausrichtung ab STEP496

Das Dashboard soll sich künftig wie das Kanalpunkte-System bedienen:

```text
Commands:      Chat schreibt !befehl
Kanalpunkte:   Viewer klickt Reward/Button
```

Gemeinsame UX-Bausteine:

- Kategorien
- Suche
- Statusfilter
- Liste links
- Detail-/Editorbereich rechts
- Aktionstyp
- Medienzuordnung
- Regeln/Cooldowns
- Test/History/Logs

## Geänderte Dashboard-Datei

```text
htdocs/dashboard/modules/commands.css
```

## Backend-Regel

STEP496 ändert keine Command-Backendlogik. Bestehende Routen und DB-Tabellen bleiben unverändert.
