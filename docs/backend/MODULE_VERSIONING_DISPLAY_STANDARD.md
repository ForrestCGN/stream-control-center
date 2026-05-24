# Module Versioning Display Standard

## Verbindlicher Standard

Für das gesamte `stream-control-center` gilt:

```text
Module / Code / API / UI:
- sichtbar nur Versionsnummern verwenden
- keine sichtbaren STEP-Angaben
- keine Anzeigen im Muster `vX / STEP...`

STEPs:
- nur für Doku, Projektstand, Changelog, ZIP-Namen und Übergaben
```

## Module

Module sollen ihre öffentliche Version so führen:

```js
const MODULE_META = {
  name: 'example_module',
  version: '1.2.3',
  description: '...'
};
```

Nicht mehr neu verwenden:

```js
build: 'STEP...'
```

## APIs

Neue oder überarbeitete API-Antworten geben sichtbar nur noch `moduleVersion` oder vergleichbare Versionsfelder aus.

Bestehende alte API-Felder mit Build-/Step-Bezug dürfen aus Kompatibilitätsgründen vorerst bestehen bleiben, sollen aber nicht in UI-/Debug-Ansichten angezeigt werden.

## UI / Debug-Views / Overlays

Statuskarten, Debug-Views und Overlays zeigen nur Versionsnummern, zum Beispiel:

```text
0.7.0
v0.1.3
```

Nicht mehr:

```text
0.7.0 / STEP278S
v0.1.3 / STEP278T
```

## Debug-Views

Debug-Views dürfen interne Rohdaten aus APIs anzeigen, müssen aber sichtbare Build-/Step-Felder ausfiltern, sofern diese nur historisch/kompatibel vorhanden sind.

Auto-Refresh- oder Live-Status-Anzeigen zeigen ebenfalls nur Tool- und Modulversionen.
