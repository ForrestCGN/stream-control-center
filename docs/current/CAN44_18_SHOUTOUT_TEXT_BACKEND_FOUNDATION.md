# CAN-44.18 – Shoutout Text Backend Foundation

Stand: 2026-06-04

## Zweck

Dieser Step legt die Backend-Grundlage für den späteren gemeinsamen Texte-Tab im Shoutout-System.

Shoutout, AutoShoutout und offizieller Twitch-Shoutout bleiben technisch im gemeinsamen Modul `clip_shoutout`. Die neue Text-Fundament-Route arbeitet über den bestehenden `helper_texts` und die Tabelle `module_text_variants`.

## Änderungstyp

Code-Änderung am Backend-Modul, aber keine Dashboard-Änderung und keine Runtime-Umstellung der bestehenden Chat-Ausgaben.

Die bestehenden Config-Texte bleiben weiterhin Fallback. Die alte AutoShoutout-Route `/api/clip-shoutout/auto/texts` bleibt bestehen.

## Betroffene Dateien

```text
backend/modules/clip_shoutout.js
docs/current/CAN44_18_SHOUTOUT_TEXT_BACKEND_FOUNDATION.md
docs/current/CAN44_18_README.md
docs/modules/SHOUTOUT_TEXT_BACKEND_FOUNDATION.md
```

## Backend-Version

```text
clip_shoutout MODULE_VERSION: 0.2.25
```

## Neue zentrale Text-Struktur

Neue Textkeys werden unter `shoutout.*` vorbereitet:

```text
shoutout.chat.accepted
shoutout.chat.waiting
shoutout.chat.failed
shoutout.chat.duplicate

shoutout.auto.greeting
shoutout.auto.queued
shoutout.auto.alreadyQueued
shoutout.auto.alreadyReceived
shoutout.auto.cooldown
shoutout.auto.waitingStartScene
shoutout.auto.disabled

shoutout.official.queued
shoutout.official.failed

shoutout.system.textsSaved
```

## Kategorien

```text
shoutout.chat       = Chat-Shoutout
shoutout.auto       = AutoShoutout
shoutout.official   = Offizieller Twitch-Shoutout
shoutout.dashboard  = Dashboard
shoutout.system     = System
```

## Neue Routen

### GET /api/clip-shoutout/texts

Liefert den gemeinsamen Texteditor-Status für das Shoutout-System:

```text
module
moduleVersion
texts
migration
compatibility
```

### POST /api/clip-shoutout/texts

Nutzt den bestehenden `helper_texts`-Payload-Handler.

Zusätzlich unterstützt:

```json
{
  "action": "replaceKeyVariants",
  "key": "shoutout.auto.greeting",
  "category": "shoutout.auto",
  "variants": [
    "Textvariante 1",
    "Textvariante 2"
  ]
}
```

### GET /api/clip-shoutout/texts/migration

Liefert eine Readonly-Migrationsübersicht:

```text
plannedKeys
legacyMappings
compatibility
nextImplementationStep
```

Diese Route verändert nichts an Daten oder Config.

## Kompatibilität

- `/api/clip-shoutout/auto/texts` bleibt bestehen.
- `auto.greeting` bleibt als Legacy/Fallback erhalten.
- Bestehende Config-Texte werden nicht gelöscht.
- Die Runtime nutzt noch nicht vollständig die neuen `shoutout.*` Keys.
- Der spätere Dashboard-Texttab soll auf `/api/clip-shoutout/texts` aufbauen.

## Datenbank

Genutzt wird weiterhin die bestehende zentrale Textvarianten-Tabelle:

```text
module_text_variants
```

Die Tabelle wird über `helper_texts.ensureModuleTextVariantsTable()` verwaltet.

Keine bestehende Datenbank wird ersetzt oder neu gebaut.

## EventBus

Beim Speichern über `/api/clip-shoutout/texts` wird ein Event ausgegeben:

```text
shoutout.texts.updated
```

## Tests

Ausgeführt:

```powershell
node -c backend/modules/clip_shoutout.js
```

Ergebnis:

```text
syntax_ok
```

## Offene Punkte

- CAN-44.19: Dashboard-Texttab vorbereiten/strukturieren.
- Danach Runtime schrittweise von Legacy-Config-Texten auf `shoutout.*` Textkeys umstellen.
- Alte Keys nicht hart entfernen, sondern Fallback-/Migration sauber beibehalten.
