# Module Versioning Display Standard

## Verbindlicher Standard

Module, Tools, APIs und UI-Ausgaben zeigen sichtbar nur Versionsnummern.

STEP-Angaben werden ausschließlich für Doku, Projektstand, Changelog, ZIP-Namen und Übergaben genutzt.

## Richtig

```js
const MODULE_META = {
  name: 'example_module',
  version: '1.2.3',
  description: '...'
};
```

Sichtbare Anzeige:

```text
example_module v1.2.3
```

## Nicht mehr verwenden

```js
const MODULE_META = {
  name: 'example_module',
  version: '1.2.3',
  build: 'STEP123'
};
```

Sichtbare Anzeigen im Muster `1.2.3 / STEP123` sind nicht mehr vorgesehen.

## Ausnahme

STEP-Angaben bleiben erlaubt in:

- Markdown-Dokumentation
- Projektstand-Dateien
- Changelog
- ZIP-/Übergabenamen
- Test-/Übergabe-Notizen

## Bestehende Kompatibilität

Falls ältere APIs noch Build-/Step-Felder ausgeben, dürfen UI-/Debug-Seiten diese Felder nicht sichtbar anzeigen. Neue oder überarbeitete Module sollen solche Felder nicht mehr neu einführen.
