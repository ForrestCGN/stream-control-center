# STEP182.3 - Hug Chatweite Hugs Editor

Stand: 2026-05-05

## Ziel

Die Kategorie `Chatweite Hugs` im Hug-Dashboard editierbar machen.

## Wichtig

Dieser STEP aendert nicht die Hug/Rehug-Paarlogik.

- Hug/Rehug-Paare bleiben gekoppelt ueber `hug_text_pairs`.
- Chatweite Hugs sind einfache Einzeltexte in `hug_texts` mit `kind = hug_all`.
- Keine Typen-Komplexitaet wird zurueckgebracht.

## Betroffene Dateien

```text
backend/modules/hug.js
htdocs/dashboard/modules/hug.js
htdocs/dashboard/modules/hug.css
project-state/STEP182_3_HUG_ALL_TEXT_EDITOR_2026-05-05.md
```

## Backend

Neue Admin-/Dashboard-Routen:

```text
GET  /api/hug/admin/hug-all-texts
POST /api/hug/admin/hug-all-texts
GET  /api/dashboard/community/hug/hug-all-texts
POST /api/dashboard/community/hug/hug-all-texts
```

Funktionen:

- aktive und inaktive `hug_all` Texte listen
- neuen chatweiten Hug-Text anlegen
- bestehenden Text bearbeiten
- Aktiv/Inaktiv setzen
- Gewichtung setzen
- Sortierung setzen
- Text loeschen

## Dashboard

Kategorie `Chatweite Hugs` ist jetzt editierbar:

- neue Texte anlegen
- Texte bearbeiten
- Aktiv/Inaktiv
- Gewichtung
- Sortierung
- Loeschen

## Bewusst nicht geaendert

- Keine DB-Datei
- Keine Migration
- Keine Aenderung an `hug_text_pairs`
- Keine Aenderung an Rehug-Fachlogik
- Keine Bearbeitung von Systemantworten/Toplisten in diesem STEP

## Test

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\hug.js
node -c .\htdocs\dashboard\modules\hug.js
.\stepdone.cmd "feat: add hug all text editor"
```

Nach Deploy/Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/dashboard/community/hug/hug-all-texts" | ConvertTo-Json -Depth 20
```

Dashboard:

```text
Community -> Hug-System -> Texte -> Chatweite Hugs
```
