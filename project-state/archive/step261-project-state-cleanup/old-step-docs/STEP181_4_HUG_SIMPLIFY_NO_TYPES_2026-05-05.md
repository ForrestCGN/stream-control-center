# STEP181.4 - Hug/Rehug ohne Typen-Komplexität

Stand: 2026-05-05

## Ziel

Das Hug/Rehug-System wird für die Bedienung vereinfacht.

Forrest braucht keine sichtbaren Hug-Typen. Wichtig ist nur:

```text
Text 1 -> Antwort-Text 1
Text 2 -> Antwort-Text 2
```

## Fachliche Änderung

Die Runtime-Auswahl für `!hug` zieht jetzt ein aktives Textpaar global aus `hug_text_pairs`.

Der zugehörige `type_id` bleibt nur noch als internes Kompatibilitäts-/Migrationsfeld erhalten.

Beim `!rehug` wird weiterhin die gespeicherte `pair_id` aus `hug_pending_rehugs` genutzt. Dadurch bleibt garantiert:

```text
gezogener Hug-Text -> exakt passende Rehug-Antwort
```

## Dashboard-Änderung

Im Hug-Dashboard wird der Typen-Tab entfernt.

Im Texte-Tab wird die Anzeige vereinfacht:

- Textpaare statt Typen
- Text / Antwort-Text
- Suche
- Aktiv/Inaktiv
- Gewichtung
- Sortierung
- Speichern/Löschen

Nicht mehr prominent:

- Typ-Filter
- Typ-Auswahl
- kreative Pair-Namen

## Bewusst erhalten

Die Tabelle `hug_types` bleibt bestehen.
Die Spalte `type_id` in `hug_text_pairs` bleibt bestehen.
Bestehende Daten werden nicht gelöscht.
Bestehende Statistiken bleiben erhalten.

## Betroffene Dateien

```text
backend/modules/hug.js
htdocs/dashboard/modules/hug.js
htdocs/dashboard/modules/hug.css
project-state/STEP181_4_HUG_SIMPLIFY_NO_TYPES_2026-05-05.md
```

## Tests

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\hug.js
node -c .\htdocs\dashboard\modules\hug.js
.\copylive
```

Backend neu starten.

Danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hug/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/dashboard/community/hug/text-pairs" | ConvertTo-Json -Depth 30
```
