(function(){
  'use strict';

  const DEFAULT_DEBOUNCE_MS = 180;

  function noop() {}

  function isTextLike(el) {
    if (!el) return false;
    const tag = String(el.tagName || '').toLowerCase();
    if (tag === 'textarea') return true;
    if (tag !== 'input') return false;
    const type = String(el.type || 'text').toLowerCase();
    return ['text','search','email','url','tel','number','password'].includes(type);
  }

  function defaultFocusSelector(el) {
    if (!el) return '';
    if (el.id) return `#${CSS.escape(el.id)}`;
    const keys = Array.from(el.attributes || [])
      .map(a => a.name)
      .filter(name => name.startsWith('data-'));
    if (keys.length) return `[${CSS.escape(keys[0])}]`;
    if (el.name) return `${String(el.tagName || '').toLowerCase()}[name="${String(el.name).replace(/"/g, '\\"')}"]`;
    return '';
  }

  function create(root, options = {}) {
    const cfg = {
      debounceMs: Number(options.debounceMs ?? DEFAULT_DEBOUNCE_MS) || DEFAULT_DEBOUNCE_MS,
      apply: typeof options.apply === 'function' ? options.apply : noop,
      render: typeof options.render === 'function' ? options.render : noop,
      read: typeof options.read === 'function' ? options.read : noop,
      onError: typeof options.onError === 'function' ? options.onError : (err => console.error(err)),
      focusSelector: typeof options.focusSelector === 'function' ? options.focusSelector : defaultFocusSelector
    };

    let timer = null;
    let seq = 0;
    let disposed = false;

    function getRoot() {
      return typeof root === 'function' ? root() : root;
    }

    function captureFocus(el) {
      const active = el || document.activeElement;
      const currentRoot = getRoot();
      if (!active || !currentRoot || !currentRoot.contains(active)) return null;
      const selector = cfg.focusSelector(active);
      if (!selector) return null;
      return {
        selector,
        start: isTextLike(active) ? active.selectionStart : null,
        end: isTextLike(active) ? active.selectionEnd : null
      };
    }

    function restoreFocus(focus) {
      if (!focus) return;
      const currentRoot = getRoot();
      const el = currentRoot?.querySelector?.(focus.selector);
      if (!el) return;
      try {
        el.focus({ preventScroll: true });
        if (isTextLike(el) && focus.start !== null && focus.end !== null && typeof el.setSelectionRange === 'function') {
          const len = String(el.value || '').length;
          el.setSelectionRange(Math.min(focus.start, len), Math.min(focus.end, len));
        }
      } catch (_) {}
    }

    async function run(context = {}, immediate = false) {
      if (disposed) return;
      const focus = context.focus || captureFocus(context.element);
      if (timer) clearTimeout(timer);
      const mySeq = ++seq;
      const execute = async () => {
        if (disposed || mySeq !== seq) return;
        try {
          await cfg.read(context);
          await cfg.apply(context);
          if (disposed || mySeq !== seq) return;
          await cfg.render(context);
          restoreFocus(focus);
        } catch (err) {
          if (disposed || mySeq !== seq) return;
          cfg.onError(err, context);
        }
      };
      if (immediate) return execute();
      timer = setTimeout(execute, cfg.debounceMs);
    }

    function clear() {
      if (timer) clearTimeout(timer);
      timer = null;
      seq += 1;
    }

    function dispose() {
      disposed = true;
      clear();
    }

    return { run, clear, dispose, captureFocus, restoreFocus };
  }

  function bind(root, selector, options = {}) {
    const controller = create(root, options);
    const eventNames = options.events || 'input change';
    const currentRoot = typeof root === 'function' ? root() : root;
    if (!currentRoot) return controller;
    String(eventNames).split(/\s+/).filter(Boolean).forEach(eventName => {
      currentRoot.querySelectorAll(selector).forEach(el => {
        el.addEventListener(eventName, ev => controller.run({ event: ev, element: el }, eventName === 'change' && options.changeImmediate !== false));
      });
    });
    return controller;
  }

  window.CGNReactiveControls = { create, bind };
  window.CGN = window.CGN || {};
  window.CGN.reactiveControls = window.CGNReactiveControls;
})();
