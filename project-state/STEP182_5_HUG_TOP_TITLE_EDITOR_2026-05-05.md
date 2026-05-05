# STEP182.5 - Hug Toplisten Titel Editor

Stand: 2026-05-05

## Ziel

Die Kategorie `Toplisten` im Hug-Dashboard editierbar machen.

## Wichtig

Dieser STEP aendert nicht die Hug/Rehug-Paarlogik.

- Hug/Rehug-Paare bleiben gekoppelt ueber `hug_text_pairs`.
- Chatweite Hugs bleiben `hug_texts` mit `kind = hug_all`.
- Systemantworten bleiben `hug_texts` mit `kind = response`.
- Toplisten-Titel sind `hug_texts` mit `kind = top_title`.

## Betroffene Dateien

```text
backend/modules/hug.js
htdocs/dashboard/modules/hug.js
htdocs/dashboard/modules/hug.css
project-state/STEP182_5_HUG_TOP_TITLE_EDITOR_2026-05-05.md
```

## Backend

Neue Admin-/Dashboard-Routen:

```text
GET  /api/hug/admin/top-title-texts
POST /api/hug/admin/top-title-texts
GET  /api/dashboard/community/hug/top-title-texts
POST /api/dashboard/community/hug/top-title-texts
```

Funktionen:

- aktive und inaktive Toplisten-Titel listen
- neuen Toplisten-Titel anlegen
- bestehenden Titel bearbeiten
- Text-Key bearbeiten
- Aktiv/Inaktiv setzen
- Gewichtung setzen
- Sortierung setzen
- Titel loeschen

## Dashboard

Kategorie `Toplisten` ist jetzt editierbar:

- Text-Key sichtbar
- lesbare Labels fuer bekannte Keys
- Titel bearbeiten
- Aktiv/Inaktiv
- Gewichtung
- Sortierung
- Loeschen

## Bewusst nicht geaendert

- Keine DB-Datei
- Keine Migration
- Keine Aenderung an `hug_text_pairs`
- Keine Aenderung an Rehug-Fachlogik

## Test

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\hug.js
node -c .\htdocs\dashboard\modules\hug.js
.\stepdone.cmd "feat: add hug top title editor"
```

Nach Deploy/Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/dashboard/community/hug/top-title-texts" | ConvertTo-Json -Depth 20
```

Dashboard:

```text
Community -> Hug-System -> Texte -> Toplisten
```
