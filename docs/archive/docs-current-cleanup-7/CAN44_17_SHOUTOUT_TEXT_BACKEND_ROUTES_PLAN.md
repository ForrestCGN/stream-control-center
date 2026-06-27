# CAN-44.17 – Shoutout Text Backend Routes Plan / Foundation

Stand: 2026-06-04

## Ziel

Dieser Step bereitet den gemeinsamen Text-Backend-Bereich für das Shoutout-System vor.

Es werden noch keine produktiven Code-Dateien geändert. Der Step definiert, wie die späteren Backend-Routen für den gemeinsamen Shoutout-Text-Tab aussehen sollen und wie sie sich an die bestehenden Projektstandards halten müssen.

## Ausgangslage

Das Shoutout-System ist technisch bereits ein gemeinsames Modul unter `backend/modules/clip_shoutout.js`.

Aktuelle Teilbereiche:

```text
Chat-Shoutout      -> !so / !vso / Dashboard-Auslösung
AutoShoutout       -> automatische Auslösung über Chat-Aktivität
Official Shoutout  -> Twitch Send Shoutout nach Display-/Video-Shoutout
Inbound Shoutout   -> empfangene/ausgehende EventSub-Shoutout-Events
DisplayQueue       -> gemeinsame Anzeige-/Video-Queue
```

Der gemeinsame Textbereich soll nicht als neues Parallelsystem gebaut werden, sondern auf dem vorhandenen `helper_texts`-System basieren.

## Standards

Verbindlich:

```text
- Bestehende app.sqlite niemals ersetzen.
- Neue DB-Logik nur sanft per CREATE TABLE IF NOT EXISTS / ensure helper.
- Möglichst DB-portabel planen, also keine unnötigen SQLite-Spezialfälle.
- Vorhandene Helper verwenden:
  - helper_texts
  - helper_config
  - helper_core
  - helper_messages
  - helper_routes, falls passend
  - database/core
- Keine Parallelstruktur für Texte.
- Alte Config-Texte bleiben Fallback.
- Textvarianten sollen über module_text_variants laufen.
```

## Zielroute: Text-Status

```text
GET /api/clip-shoutout/texts
```

Zweck:

```text
Gemeinsamer Text-Status für den künftigen Dashboard-Tab "Texte".
```

Soll liefern:

```json
{
  "ok": true,
  "module": "clip_shoutout",
  "moduleVersion": "0.2.x",
  "texts": {
    "ok": true,
    "module": "clip_shoutout",
    "categories": [],
    "keys": [],
    "rows": []
  },
  "migration": {
    "legacyConfigFallbacks": [],
    "missingVariantKeys": [],
    "deprecatedKeys": []
  }
}
```

## Zielroute: Text speichern

```text
POST /api/clip-shoutout/texts
```

Zweck:

```text
Gemeinsame Schreibroute für alle Shoutout-Textvarianten.
```

Soll `helper_texts.handleModuleTextEditorPayload(...)` verwenden, nicht eigene DB-Logik.

Zusätzlich soll eine einfache Kompatibilitäts-Aktion für Variantenlisten möglich sein:

```json
{
  "action": "replaceKeyVariants",
  "key": "shoutout.auto.greeting",
  "category": "shoutout.auto",
  "variants": [
    "Text 1",
    "Text 2"
  ]
}
```

## Zielroute: Text-Seeding / Migration prüfen

```text
GET /api/clip-shoutout/texts/migration
```

Zweck:

```text
Read-only Prüfung, welche alten Config-Texte noch nicht in module_text_variants vorhanden sind.
```

Diese Route soll nicht automatisch produktive Texte überschreiben.

Soll anzeigen:

```text
- vorhandene neue Keys
- fehlende neue Keys
- alte Config-Textquellen
- Fallback-Zuordnung alt -> neu
```

## Optional spätere Route: Seed anwenden

```text
POST /api/clip-shoutout/texts/seed
```

Nur mit klarer Absicherung.

Zweck:

```text
Fehlende Standardvarianten aus den aktuellen Defaults/Config-Fallbacks anlegen.
```

Regeln:

```text
- bestehende DB-Varianten nicht überschreiben
- nur fehlende Keys ergänzen
- als source="seed" oder source="migration" markieren
- Ergebnis mit Anzahl inserted/skipped zurückgeben
```

## Text-Key Zielstruktur

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

## Kompatibilitäts-Fallbacks

Alte Quellen dürfen nicht hart entfernt werden.

Mapping:

```text
clipShoutout.chatMessage
  -> shoutout.chat.accepted

displayQueue.acceptedMessage
  -> shoutout.chat.accepted

displayQueue.waitingMessage
  -> shoutout.chat.waiting

displayQueue.failedMessage
  -> shoutout.chat.failed

streamDayLimit.duplicateMessage
  -> shoutout.chat.duplicate

autoShoutout.messages.queued
  -> shoutout.auto.queued

autoShoutout.messages.alreadyQueued
  -> shoutout.auto.alreadyQueued

autoShoutout.messages.waitingStartScene
  -> shoutout.auto.waitingStartScene

autoShoutout.messages.cooldown
  -> shoutout.auto.cooldown

autoShoutout.messages.disabled
  -> shoutout.auto.disabled

auto.greeting
  -> shoutout.auto.greeting

officialShoutout.queuedMessage
  -> shoutout.official.queued

officialShoutout.sentMessage
  -> shoutout.official.sent

officialShoutout.duplicateQueuedMessage
  -> shoutout.official.duplicateQueued

officialShoutout.targetCooldownMessage
  -> shoutout.official.targetCooldown

officialShoutout.failedMessage
  -> shoutout.official.failed
```

## Dashboard-Ziel

Der spätere Dashboard-Tab soll heißen:

```text
Texte
```

Er soll Kategorien anzeigen:

```text
Chat-Shoutout
AutoShoutout
Offizieller Shoutout
Dashboard/System
```

Jeder Key soll mehrere Varianten unterstützen:

```text
- Variante hinzufügen
- Variante bearbeiten
- aktiv/deaktivieren
- Gewichtung
- Sortierung
- speichern
```

## Akzeptanzkriterien für CAN-44.18

CAN-44.18 darf erst Code ändern, wenn diese Punkte eingehalten werden:

```text
- zentrale Defaults für Shoutout-Texte definiert
- Kategorien sauber definiert
- GET /api/clip-shoutout/texts liefert Editor-Struktur
- POST /api/clip-shoutout/texts nutzt helper_texts
- bestehende /auto/texts bleibt als Kompatibilitätsroute erhalten
- keine bestehende Funktionalität wird entfernt
- node -c backend/modules/clip_shoutout.js erfolgreich
```

## Offene Punkte

```text
- finale Textformulierungen müssen später separat überarbeitet werden
- Dashboard-Rebuild kommt nach Text-Backend und Text-Tab
- alte Config-Texte später nur als Fallback behalten, nicht sofort entfernen
```
