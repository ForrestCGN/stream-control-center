# CAN-44.21.13 – Shoutout Textvarianten CGN-Altersheimkino

## Stil

Fester Stil für diese Textsammlung:

```text
CGN-Altersheimkino
VHS / DVD / TV-Raum / Kinosaal
Beamer von anno dazumal
Heimleitung = Programmleitung
Heimaufsicht = kontrolliert Sendeplan und Vorführung
Rentnercrew = sitzt im TV-/Kinoraum
```

Kein Rollator-Fokus.

## Enthaltene Keys

Alle folgenden Keys werden auf jeweils 5 Varianten gesetzt:

```text
auto.greeting

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

## Wichtig

Der Import schreibt über die vorhandene bestätigte API:

```text
POST /api/clip-shoutout/texts
```

mit:

```json
{
  "action": "replaceKeyVariants",
  "key": "...",
  "category": "...",
  "variants": [...]
}
```

Das bedeutet: Für die genannten Keys werden die Varianten ersetzt.

## Dateien

```text
tools/shoutout_text_variants_cgn_altersheim_can44_21_13.json
tools/import_shoutout_text_variants_can44_21_13.ps1
```
