# STEP496_COMMANDS_DASHBOARD_ALIGNMENT

Stand: 2026-05-26

## Ziel

Das Command-Dashboard wird optisch und strukturell näher an das neue Kanalpunkte-Dashboard gebracht, damit beide Systeme künftig fast gleich bedient werden können.

## Geänderte Datei

```text
htdocs/dashboard/modules/commands.css
```

## Inhalt

- Commands behalten bestehende API- und JS-Logik.
- Layout wird stärker an das Kanalpunkte-Muster angeglichen.
- Liste links / Detail rechts wird visuell betont.
- Cards, Pills, Tabs, Inputs und Editorflächen bekommen den gleichen Neon-/Glass-Stil.
- Hinweistext im Command-Modul erklärt den gemeinsamen Bedienansatz.

## Nicht geändert

- Kein Backend.
- Keine Datenbank.
- Keine Command-Ausführungslogik.
- Keine Twitch-/Streamer.bot-Logik.
- Keine neue Funktionalität entfernt.

## Tests

Browser:

```text
http://127.0.0.1:8080/dashboard/
Community -> Commands
Community -> Kanalpunkte
```

Erwartung:

- Commands wirken optisch näher an Kanalpunkte.
- Bestehende Command-Funktionen bleiben bedienbar.
- Kanalpunkte bleiben unverändert aus STEP495.
