# STEP181.1 - Hug/Rehug Text-Paare Backend

Stand: 2026-05-05

## Ziel

Das Hug/Rehug-System wird backendseitig so vorbereitet, dass Hug- und Rehug-Texte als feste Paare verwaltet werden koennen.

Wichtig: Ein beim `!hug` gewaehlter Hug-Text muss beim spaeteren `!rehug` exakt den dazu passenden Antworttext verwenden.

## Betroffene Datei

```text
backend/modules/hug.js
```

## Neue Datenbank-Grundlage

Neue Tabelle:

```text
hug_text_pairs
```

Felder:

```text
id
 type_id
 category
 name
 hug_text
 rehug_text
 enabled
 weight
 sort_order
 source
 created_at
 updated_at
```

Erweiterung bestehender Tabelle:

```text
hug_pending_rehugs.pair_id
```

Die Spalte wird nur ergaenzt, wenn sie noch nicht existiert.

## Migration

Bestehende Daten bleiben erhalten.

Aus `hug_texts` werden bestehende Texte paarweise in `hug_text_pairs` uebernommen:

- `kind = hug`
- `kind = rehug`
- gleicher `type_id`
- Reihenfolge nach `sort_order`/`id`

Es wird nichts aus `hug_texts` geloescht.

## Laufzeitlogik

### !hug

- waehlt weiterhin einen Hug-Typ nach Gewichtung
- waehlt danach ein aktives Text-Paar aus `hug_text_pairs`
- gibt `hug_text` aus
- speichert `pair_id` in `hug_pending_rehugs`

### !rehug

- sucht den passenden Pending-Rehug
- liest `pair_id`
- gibt exakt den passenden `rehug_text` aus
- alte Pending-Eintraege ohne `pair_id` bleiben ueber Fallback kompatibel

## Neue/erweiterte Routen

Status-Alias ergaenzt:

```text
GET /api/hug/status
```

Textpaar-Editor-Grundlage:

```text
GET  /api/hug/admin/text-pairs
POST /api/hug/admin/text-pairs
GET  /api/dashboard/community/hug/text-pairs
POST /api/dashboard/community/hug/text-pairs
```

## Bewusst nicht geaendert

- Keine vorhandene Hug-/Rehug-Funktion entfernt.
- Keine bestehenden Tabellen geloescht.
- `hug_texts` bleibt als Legacy-/Fallback-Datenbestand erhalten.
- Dashboard-UI wird erst im naechsten STEP angepasst.
- Settings-Umbau auf zentralen Settings-Helper ist nicht Teil dieses STEP.

## Tests

Vor dem Einsatz lokal pruefen:

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\hug.js
```

Nach Deploy/Backend-Neustart pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hug/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/hug/admin/text-pairs" | ConvertTo-Json -Depth 30
```

Erwartung:

- `schemaVersion` ist 3
- `counts.hugTextPairs` ist groesser 0
- `counts.activeHugTextPairs` ist groesser 0
- Textpaare werden unter `/api/hug/admin/text-pairs` geliefert

## Naechster Schritt

STEP181.2:

- Dashboard-Tab `Texte` auf Kategorie-Editor umbauen.
- Kategorie `Hug/Rehug-Paare` mit gekoppelt editierbaren Feldern:
  - Hug-Text
  - Rehug-Antwort
  - Typ
  - Aktiv/Inaktiv
  - Gewichtung
- Weitere Kategorien spaeter fuer:
  - chatweite Hugs
  - Systemantworten
  - Toplisten
