# STEP190.2 - SoundAlerts Layout Cleanup

Stand: 2026-05-06

## Zweck

Die Ansicht `SoundAlerts -> Einträge` wurde optisch aufgeräumt. Ziel war ein klarer, symmetrischer Aufbau ohne doppelte Vorschau-/Bearbeitungsbereiche.

## Betroffene Dateien

```text
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/soundalerts.css
```

## Geändert

- Modulname bleibt schlicht `SoundAlerts`.
- Tab `Einträge` bleibt erhalten.
- Der Einträge-Bereich wurde in ein sauberes Zwei-Spalten-Layout umgebaut:
  - links: Auswahl + Kartenliste aller SoundAlert-Einträge
  - rechts: Editor für genau den ausgewählten Eintrag
- Der doppelte Zwischenblock mit Vorschau + Bearbeiten/Löschen wurde entfernt.
- `Bearbeiten` in der Karte wählt den Eintrag aus und lädt ihn rechts in den Editor.
- `Löschen` bleibt mit Sicherheitsabfrage erhalten.
- `Neuer SoundAlert` legt einen inaktiven Eintrag an und öffnet ihn direkt im Editor.
- Kategorie-Auswahl bleibt vorhanden und setzt weiterhin passende Standard-Prioritäten.
- Events behalten Aktionen:
  - Erneut abspielen
  - Eintrag bearbeiten
  - Eintrag erstellen

## Nicht geändert

- Keine Backend-Änderung.
- Keine API-Änderung.
- Keine DB-Änderung.
- Bestehende Config-Struktur `config.rules` bleibt erhalten.
- Bestehende Tests/Reload/Save-Funktionen bleiben erhalten.

## Test

Syntax:

```text
node -c htdocs/dashboard/modules/soundalerts.js
```

Erwartung:

```text
OK
```

Manuell im Dashboard:

1. `SoundAlerts -> Einträge` öffnen.
2. Layout links Liste / rechts Editor prüfen.
3. Dropdown wählt Eintrag.
4. Kartenklick wählt Eintrag.
5. Bearbeiten wählt Eintrag.
6. Neuer SoundAlert erstellt inaktiven Eintrag.
7. Löschen fragt nach.
8. Speichern funktioniert.
9. Events-Aktionen bleiben sichtbar.

## Offen

- SoundAlert-Inbox serverseitig ist weiterhin STEP189 und noch nicht umgesetzt.
- Datei-Upload/Zuweisung aus unbekannten Events ist noch offen.
- Prioritäten/Kategorien sollen später optional vollständig aus Sound-System-Config gelesen werden.
