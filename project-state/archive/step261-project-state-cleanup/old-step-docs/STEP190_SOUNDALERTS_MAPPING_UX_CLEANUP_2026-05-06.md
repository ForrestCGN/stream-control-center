# STEP190 - SoundAlerts Mapping UX Cleanup

Stand: 2026-05-06

## Zweck

Dashboard-UX fuer SoundAlerts-Mappings bereinigen.

Bisher war der Tab technisch als "Mappings" bezeichnet und bestand aus einem grossen Formularblock. Das war fuer die Bedienung unklar, weil diese Daten fachlich SoundAlert-Eintraege sind.

## Geaendert

Betroffene Dateien:

```text
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/soundalerts.css
```

### UI

- Tab `Mappings` wurde in `Eintraege` umbenannt.
- Modul-Titel wurde von `SoundAlerts Bridge` zu `SoundAlerts` vereinfacht.
- Beschreibung wurde von technischer Bridge-Formulierung auf SoundAlert-Eintraege angepasst.
- Der Bereich heisst jetzt `SoundAlert-Eintraege`.

### Bedienung

Neue Struktur:

```text
SoundAlert-Eintraege
- Dropdown: SoundAlert auswaehlen
- Kartenliste aller vorhandenen Eintraege
- Editor fuer den aktuell gewaehlten Eintrag
- Neuer SoundAlert
- Eintraege speichern
```

Pro Eintrag sichtbar:

```text
Label / Name
Typ Audio/Video
Aktiv/Inaktiv
SoundAlerts-Name
Datei
Prioritaet
Lautstaerke
```

### Aktionen

- Eintrag auswaehlen per Dropdown.
- Eintrag auswaehlen per Kartenklick.
- Eintrag bearbeiten.
- Eintrag loeschen.
- Neuer SoundAlert oben anlegen.
- Alle Eintraege speichern.

Vor dem Loeschen fragt das Dashboard per Confirm nach.

## Nicht geaendert

- Keine Backend-Aenderung.
- Keine DB-Aenderung.
- Keine API-Aenderung.
- Bestehende Config-Struktur `config.rules` bleibt erhalten.
- Bestehende Funktionen wie Reload, Test Fahrstuhl, Test Unbekannt, Save Config bleiben erhalten.
- Videos bleiben fachlich weiterhin Overlay-Thema; dieser STEP aendert nur die UI.

## Technischer Hinweis

Da nur der aktuell ausgewaehlte Eintrag im Editor gerendert wird, wird dieser Eintrag vor Auswahlwechsel, Speichern, Hinzufuegen oder Loeschen in die lokale Config zurueckgeschrieben. Dadurch gehen ungespeicherte Editor-Aenderungen beim Wechsel nicht sofort verloren.

## Test

Syntax:

```text
node -c htdocs/dashboard/modules/soundalerts.js
```

Erwartung:

```text
OK
```

Manueller Dashboard-Test:

1. Dashboard oeffnen.
2. SoundAlerts-Modul oeffnen.
3. Tab `Eintraege` pruefen.
4. Dropdown waehlt vorhandene Eintraege aus.
5. Kartenklick waehlt vorhandene Eintraege aus.
6. Editor zeigt den gewaehlten Eintrag.
7. Wert aendern, anderen Eintrag waehlen, wieder zurueck wechseln.
8. Loeschen fragt nach.
9. Neuer SoundAlert legt oben einen leeren Eintrag an.
10. Eintraege speichern.
11. Reload pruefen.

## Offene Punkte

- SoundAlert-Inbox/Import-Workflow aus STEP189 ist noch nicht umgesetzt.
- SoundAlert-Datei-Upload aus der Inbox ist noch nicht umgesetzt.
- Prioritaetsauswahl soll spaeter aus Sound-System-Kategorien/Prioritaeten gespeist werden.
