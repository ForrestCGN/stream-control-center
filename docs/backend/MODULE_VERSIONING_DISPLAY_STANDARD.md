# Module Versioning Display Standard

## Regel

Ab diesem Projektstand gilt verbindlich:

- Module, APIs, Tools, Debug-Views und UI-Ausgaben zeigen sichtbar nur Versionsnummern.
- STEP-Angaben werden nicht mehr als sichtbarer Modul-Build angezeigt.
- STEP-Angaben bleiben ausschließlich Projekt- und Dokumentationshistorie.

## Sichtbare Ausgaben

Erlaubt:

```text
communication_bus v0.6.0
communication_debug_view v0.1.1
```

Nicht mehr verwenden:

```text
communication_bus v0.6.0 / STEP278P
communication_debug_view v0.1.0 / STEP278Q
```

## Code-Standard

Module sollen eine klare Versionsnummer führen:

```js
const MODULE_META = {
  name: 'communication_bus',
  version: '0.7.0',
  description: '...'
};
```

Tools sollen ebenfalls nur eine Version führen:

```js
const META = {
  name: 'communication_debug_view',
  version: '0.1.1'
};
```

Nicht mehr als Modulstandard nutzen:

```js
build: 'STEP278R'
```

## Dokumentation

STEPs bleiben erlaubt und erwünscht in:

- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/NEXT_STEPS.md`
- `project-state/FILES.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- STEP-spezifischen Übergabedateien
- ZIP-Dateinamen
- Commit-Beschreibungen

## Bestehende Kompatibilität

Bestehende API-Felder wie `moduleBuild` dürfen vorübergehend aus Kompatibilitätsgründen bestehen bleiben, sollen aber in neuen oder überarbeiteten UI-/Debug-Ausgaben nicht mehr sichtbar angezeigt werden.

Ein späterer eigener Cleanup-Schritt kann alte API-Felder kontrolliert entfernen oder hinter explizite Debug-Optionen legen.
