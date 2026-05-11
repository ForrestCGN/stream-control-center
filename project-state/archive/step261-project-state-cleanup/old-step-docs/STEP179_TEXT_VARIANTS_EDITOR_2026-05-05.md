# STEP179 - Zentraler Text-Varianten-Editor fuer Tagebuch/Todo

Stand: 2026-05-05

## Ziel

Tagebuch und Todo sollen nicht mehr nur einen Einzeltext pro Text-Key verwalten, sondern mehrere aktive/inaktive Varianten pro Text-Key unterstuetzen. Bei der Ausgabe waehlt das Backend zufaellig eine aktive Variante. Die Bearbeitung im Dashboard erfolgt kategoriebasiert: erst Kategorie auswaehlen, dann Text-Keys und Varianten bearbeiten.

## Geaenderte Dateien

- `backend/modules/helpers/helper_texts.js`
- `backend/modules/tagebuch.js`
- `backend/modules/todo.js`
- `htdocs/dashboard/modules/tagebuch.js`
- `htdocs/dashboard/modules/tagebuch.css`
- `htdocs/dashboard/modules/todo.js`
- `htdocs/dashboard/modules/todo.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Backend

### Neue zentrale Tabelle

`helper_texts.js` legt sanft per `CREATE TABLE IF NOT EXISTS` eine neue Tabelle an:

- `module_text_variants`

Die vorhandene Tabelle `module_texts` bleibt erhalten und wird nicht entfernt. Bestehende Einzeltexte werden in Varianten migriert/gespiegelt.

### Neue Helper-Funktionen

- `ensureModuleTextVariantsTable`
- `seedModuleTextVariants`
- `listModuleTextVariants`
- `listModuleTextEditor`
- `pickModuleText`
- `renderModuleText`
- `setModuleTextVariant`
- `deleteModuleTextVariant`
- `handleModuleTextEditorPayload`

### Zufallsauswahl

- Aktive Varianten pro `module + key` werden zufaellig ausgewaehlt.
- Gewichtung ist vorbereitet (`weight`, Standard `1`).
- Wenn keine Variante vorhanden ist, bleibt der bisherige Default/Fallback aktiv.

### Tagebuch

Tagebuch nutzt nun Kategorien:

- `chat`
- `discord`
- `lifecycle`
- `reset`
- `errors`

Bestehende Ausgaben greifen weiterhin ueber die bisherigen Keys, aber die Werte kommen aus der Varianten-Schicht.

### Todo

Todo nutzt nun Kategorien:

- `chat`
- `discord`
- `stats`
- `errors`
- `system`

Die Funktion `t()` rendert jetzt eine zufaellig gewaehlte aktive Variante und ersetzt danach Platzhalter.

## Dashboard

Die Texte-Tabs von Tagebuch und Todo wurden vom Einzeltext-Editor auf einen kategoriebasierten Varianten-Editor umgestellt.

Ablauf:

1. Tab `Texte` oeffnen.
2. Kategorie per Dropdown auswaehlen.
3. Text-Key sehen.
4. Varianten bearbeiten, aktivieren/deaktivieren, gewichten oder loeschen.
5. Neue Variante pro Key hinzufuegen.

## Bewusst nicht geaendert

- Keine SQLite-Datei mitgeliefert.
- Keine JSON-Dateien geloescht oder ersetzt.
- Keine Tagebuch-/Todo-Funktionsrouten entfernt.
- Keine Discord-Channel-Struktur geaendert.
- Keine Admin-Rechte-/Audit-Logik eingebaut.

## Tests

Lokal geprueft:

```powershell
node -c backend/modules/helpers/helper_texts.js
node -c backend/modules/tagebuch.js
node -c backend/modules/todo.js
node -c htdocs/dashboard/app.js
node -c htdocs/dashboard/modules/controlhome.js
node -c htdocs/dashboard/modules/tagebuch.js
node -c htdocs/dashboard/modules/todo.js
```

## Offene Punkte

- Live-Test der neuen Varianten-Routen.
- Dashboard-Schreibtest: Variante hinzufuegen, deaktivieren, loeschen.
- Spaeter zentralen Texteditor auch fuer Alerts/Hug/VIP/weitere Module vereinheitlichen.
- Audit-Logging fuer Admin-Aenderungen vorbereiten.
