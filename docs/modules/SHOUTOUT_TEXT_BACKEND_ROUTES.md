# Shoutout Text Backend Routes

Stand: 2026-06-04

## Zweck

Diese Datei beschreibt die geplanten gemeinsamen Text-Routen für das Shoutout-System.

Das Ziel ist ein gemeinsamer Backend-Bereich für alle Shoutout-Texte, damit der spätere Dashboard-Tab `Texte` nicht nur AutoShoutout, sondern auch Chat-Shoutout und offizielle Twitch-Shoutouts verwalten kann.

## Systembereich

```text
Backend-Modul: backend/modules/clip_shoutout.js
Modulname: clip_shoutout
API-Prefix: /api/clip-shoutout
Text-Helper: backend/modules/helpers/helper_texts.js
DB-Tabelle: module_text_variants
```

## Geplante Routen

### GET /api/clip-shoutout/texts

Liest alle Shoutout-Textvarianten.

Muss liefern:

```text
- Kategorien
- Text-Keys
- Varianten
- aktive/inaktive Varianten
- Fallback-/Migrationsstatus
```

### POST /api/clip-shoutout/texts

Schreibt Textvarianten.

Muss `helper_texts.handleModuleTextEditorPayload(...)` nutzen.

Für einfache Variantenlisten zusätzlich:

```json
{
  "action": "replaceKeyVariants",
  "key": "shoutout.auto.greeting",
  "category": "shoutout.auto",
  "variants": ["Text 1", "Text 2"]
}
```

### GET /api/clip-shoutout/texts/migration

Read-only Migrationsprüfung.

Muss anzeigen:

```text
- welche neuen Keys fehlen
- welche alten Config-Texte als Fallback dienen
- welche alten Keys noch aktiv genutzt werden
```

### POST /api/clip-shoutout/texts/seed

Optionaler späterer Step.

Darf nur fehlende Standardvarianten anlegen und bestehende Varianten nicht überschreiben.

## Kategorien

```text
shoutout.chat       -> Chat-Shoutout / !so / !vso / Dashboard-Auslösung
shoutout.auto       -> AutoShoutout
shoutout.official   -> offizieller Twitch-Shoutout
shoutout.dashboard  -> Dashboard-/Admin-Texte
shoutout.system     -> System-/Fehlertexte
```

## Ziel-Textkeys

```text
shoutout.chat.accepted
shoutout.chat.waiting
shoutout.chat.duplicate
shoutout.chat.failed

shoutout.auto.greeting
shoutout.auto.queued
shoutout.auto.alreadyQueued
shoutout.auto.waitingStartScene
shoutout.auto.cooldown
shoutout.auto.disabled

shoutout.official.queued
shoutout.official.sent
shoutout.official.duplicateQueued
shoutout.official.targetCooldown
shoutout.official.failed

shoutout.dashboard.testSuccess
shoutout.dashboard.actionDone
shoutout.dashboard.error
```

## Kompatibilität

Bestehende Routen bleiben erhalten:

```text
GET  /api/clip-shoutout/auto/texts
POST /api/clip-shoutout/auto/texts
```

Diese können später intern auf die gemeinsame Textlogik zeigen, dürfen aber nicht sofort entfernt werden.

## Migrationsregeln

```text
- alte Config-Felder bleiben Fallback
- neue module_text_variants-Keys haben Vorrang
- keine Texte hart löschen
- keine bestehenden Varianten überschreiben
- source-Feld sauber setzen: seed, migration, database
```

## Dashboard-Bezug

Der spätere Dashboard-Rebuild soll den Tab `Texte` als eigenen Haupttab im Shoutout-System erhalten.

Geplante Bedienlogik:

```text
1. Kategorie auswählen
2. Text-Key auswählen
3. Varianten bearbeiten
4. speichern
5. Vorschau mit Platzhaltern
```

## Platzhalter

Mindest-Platzhalter für Shoutout-Texte:

```text
{login}
{displayName}
@{displayName}
{waitTime}
{reason}
{streamDayId}
{targetLogin}
{targetDisplay}
```

## Tests für spätere Umsetzung

```text
node -c backend/modules/clip_shoutout.js

GET  http://127.0.0.1:8080/api/clip-shoutout/texts
GET  http://127.0.0.1:8080/api/clip-shoutout/texts/migration
POST http://127.0.0.1:8080/api/clip-shoutout/texts
GET  http://127.0.0.1:8080/api/clip-shoutout/auto/texts
```

## Status

```text
CAN-44.17 ist Planung/Foundation.
Keine Code-Änderung.
Nächster Code-Step: CAN-44.18 Shoutout Text Backend Foundation.
```
