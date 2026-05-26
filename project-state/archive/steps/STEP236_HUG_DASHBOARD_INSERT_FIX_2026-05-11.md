# STEP236 - Hug/Rehug Dashboard Insert-Fix

Stand: 2026-05-11

## Ziel

Fehler beim Anlegen neuer Hug-Dashboard-Texte beheben.

Im Dashboard trat beim Erstellen eines neuen chatweiten Hug-Texts folgender Fehler auf:

```text
Hug-Fehler: Unknown named parameter 'id'
```

## Ursache

`backend/modules/hug.js` hat bei INSERT-Statements Parameterobjekte weitergegeben, die ein Feld `id` enthielten, obwohl das jeweilige INSERT-SQL keinen Platzhalter `:id` verwendet.

Die zentrale DB-Schicht/SQLite-Bindings behandeln überzählige named parameters strikt und brechen mit `Unknown named parameter 'id'` ab.

Betroffen waren neue Einträge in:

```text
hug_texts
hug_text_pairs
```

Update bestehender Einträge war nicht betroffen, weil dort `WHERE id=:id` genutzt wird.

## Änderung

In `backend/modules/hug.js` werden bei INSERT-Pfaden nun separate `insertData`-Objekte verwendet, aus denen `id` entfernt wird.

Geändert:

```text
saveTextPair()
saveHugTextItem()
```

## Bewusst nicht geändert

```text
htdocs/dashboard/modules/hug.js
htdocs/dashboard/modules/hug.css
backend/core/database.js
config/**
data/**
app.sqlite
```

Keine Funktionalität wurde entfernt.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\hug.js
```

Live-Test nach Deploy:

```text
Dashboard -> Community -> Hug-System -> Chatweite Hugs -> neuen Text anlegen
```

Erwartung:

```text
Kein Fehler "Unknown named parameter 'id'"
Neuer Text erscheint in /api/dashboard/community/hug/hug-all-texts
```

Zusätzliche Tests:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/dashboard/community/hug/hug-all-texts" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/dashboard/community/hug/text-pairs" | ConvertTo-Json -Depth 100
```
