# STEP274U – MediaField Integration Standard

Ziel: Module mit Upload-/Medienbedarf nutzen künftig denselben Media-Picker und dasselbe Upload-Verhalten.

## Standard

- Uploads laufen über die zentrale Media-Registry.
- Module setzen immer `moduleKey` fest.
- User wählen oder erstellen nur `categoryKey`.
- Neue Uploads landen unter `htdocs/assets/media/<moduleKey>/<categoryKey>/`.
- Module speichern nur `mediaId`, nicht harte Dateipfade.
- Ausführung erfolgt modulabhängig über die offizielle Bridge, z. B. `/api/sound/play-media?mediaId=<id>`.

## Declarative usage

```html
<div class="media-field" data-media-field
     data-module-key="birthday"
     data-category-key="general"
     data-allowed-types="audio,video,image,animation"
     data-value-input="#birthdayMediaId"
     data-label-target="#birthdayMediaLabel"
     data-title="Geburtstagsmedium auswählen">
  <div class="media-field-actions">
    <button type="button" data-media-field-open>Medium auswählen</button>
    <button type="button" data-media-field-clear>Entfernen</button>
    <span id="birthdayMediaLabel">Kein Medium ausgewählt</span>
  </div>
  <div class="media-field-preview" data-media-field-preview></div>
</div>
<input type="hidden" id="birthdayMediaId" value="">
```

`MediaField.initAll(root)` initialisiert alle `[data-media-field]` innerhalb eines gerenderten Moduls.

## Programmatic usage

```js
window.MediaField.attach(root.querySelector('[data-media-field]'), {
  moduleKey: 'alerts',
  categoryKey: 'follow',
  allowedTypes: ['audio', 'video', 'image', 'animation'],
  valueInput: '#alertMediaId',
  labelTarget: '#alertMediaLabel',
  title: 'Alert-Medium auswählen',
  onSelect(asset) {
    console.log('Selected mediaId', asset.id);
  }
});
```

## Events

`media-field:change` wird auf dem Field-Root ausgelöst:

```js
root.addEventListener('media-field:change', event => {
  const { mediaId, asset } = event.detail;
});
```

## Reactive Controls Regel

Filter, Suchfelder, Dropdowns und kleine Umschalter reagieren direkt. Buttons bleiben für bewusste Aktionen wie Speichern, Löschen, Upload, Scan, Reset und Apply.
