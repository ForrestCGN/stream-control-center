# Dashboard Reactive Controls Standard

Stand: STEP274T

## Regel

Dashboard-Bedienelemente sollen direkt reagieren, wenn das technisch sinnvoll ist.

Beispiele:

- Sucheingaben filtern live beim Tippen.
- Dropdowns wenden ihre Auswahl sofort an.
- Checkboxen/Toggles aktualisieren sofort den sichtbaren Zustand.
- Buttons bleiben für explizite Aktionen wie Speichern, Löschen, Upload, Scan, Reset oder Apply erhalten.

## UX-Vorgaben

- Keine Pflicht auf eine Lupe klicken, wenn ein Filter eindeutig live aktualisiert werden kann.
- Live-Suche debounce verwenden, Standard ca. 180–250 ms.
- Dropdowns/Selects sofort per `change` anwenden.
- Nach Re-Render Fokus und Cursorposition erhalten.
- Bei abhängigen Dropdowns zuerst abhängige Werte zurücksetzen, dann sofort neu rendern/aktualisieren.
- Teure oder gefährliche Aktionen bleiben explizit per Button.

## Helper

Der Helper liegt unter:

```text
htdocs/dashboard/components/reactive_controls.js
```

Global verfügbar als:

```js
window.CGNReactiveControls
window.CGN.reactiveControls
```

Minimalbeispiel:

```js
const reactive = window.CGN.reactiveControls.create(() => root, {
  debounceMs: 180,
  read() {
    state.filter.q = root.querySelector('[data-filter-q]')?.value || '';
    state.filter.status = root.querySelector('[data-filter-status]')?.value || 'active';
  },
  async apply() {
    await loadList();
  },
  render() {
    render();
  },
  onError(err) {
    showError(err);
  }
});

root.querySelector('[data-filter-q]')?.addEventListener('input', ev => {
  reactive.run({ event: ev, element: ev.currentTarget });
});

root.querySelector('[data-filter-status]')?.addEventListener('change', ev => {
  reactive.run({ event: ev, element: ev.currentTarget }, true);
});
```

## Projektstandard ab STEP274T

Neue Dashboard-Module sollen diesen Standard verwenden, wenn sie Suchfelder, Filter, Dropdowns oder kleine Statusumschalter enthalten.

Bestehende Module werden nicht blind umgebaut. Sie werden Schritt für Schritt angepasst, wenn wir sie ohnehin anfassen.
