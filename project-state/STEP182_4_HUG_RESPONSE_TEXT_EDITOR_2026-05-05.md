# STEP182.4 - Hug Systemantworten Editor

Stand: 2026-05-05

## Ziel

Die Kategorie `Systemantworten` im Hug-Dashboard editierbar machen.

## Wichtig

Dieser STEP aendert nicht die Hug/Rehug-Paarlogik.

- Hug/Rehug-Paare bleiben gekoppelt ueber `hug_text_pairs`.
- Chatweite Hugs bleiben `hug_texts` mit `kind = hug_all`.
- Systemantworten sind `hug_texts` mit `kind = response`.

## Betroffene Dateien

```text
backend/modules/hug.js
htdocs/dashboard/modules/hug.js
htdocs/dashboard/modules/hug.css
project-state/STEP182_4_HUG_RESPONSE_TEXT_EDITOR_2026-05-05.md
```

## Backend

Neue Admin-/Dashboard-Routen:

```text
GET  /api/hug/admin/response-texts
POST /api/hug/admin/response-texts
GET  /api/dashboard/community/hug/response-texts
POST /api/dashboard/community/hug/response-texts
```

Funktionen:

- aktive und inaktive Systemantworten listen
- neue Systemantwort anlegen
- bestehenden Text bearbeiten
- Text-Key bearbeiten
- Aktiv/Inaktiv setzen
- Gewichtung setzen
- Sortierung setzen
- Text loeschen

## Dashboard

Kategorie `Systemantworten` ist jetzt editierbar:

- Text-Key sichtbar
- lesbare Labels fuer bekannte Keys
- Text bearbeiten
- Aktiv/Inaktiv
- Gewichtung
- Sortierung
- Loeschen

## Bewusst nicht geaendert

- Keine DB-Datei
- Keine Migration
- Keine Aenderung an `hug_text_pairs`
- Keine Aenderung an Rehug-Fachlogik
- Keine Bearbeitung von Toplisten in diesem STEP

## Test

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\hug.js
node -c .\htdocs\dashboard\modules\hug.js
.\stepdone.cmd "feat: add hug response text editor"
```

Nach Deploy/Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/dashboard/community/hug/response-texts" | ConvertTo-Json -Depth 20
```

Dashboard:

```text
Community -> Hug-System -> Texte -> Systemantworten
```
