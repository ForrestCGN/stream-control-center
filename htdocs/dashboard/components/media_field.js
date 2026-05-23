window.MediaField = (function(){
  'use strict';

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function clean(value) {
    return String(value ?? '').trim();
  }

  function splitList(value) {
    return clean(value).split(',').map(item => clean(item)).filter(Boolean);
  }

  function getDocRoot(root) {
    return root?.ownerDocument || document;
  }

  function findTarget(root, selector) {
    if (!selector) return null;
    const doc = getDocRoot(root);
    try { return root.querySelector(selector) || doc.querySelector(selector); }
    catch (_) { return null; }
  }

  function assetTitle(asset) {
    return asset?.label || asset?.displayName || asset?.fileName || (asset?.id ? `#${asset.id}` : 'Kein Medium ausgewählt');
  }

  function assetPath(asset) {
    return asset?.relativePath || asset?.webPath || '';
  }

  function renderPreview(root, asset) {
    const preview = root.querySelector('[data-media-field-preview]');
    if (!preview) return;
    if (!asset) {
      preview.innerHTML = '<span class="mf-muted">Kein Medium ausgewählt.</span>';
      return;
    }
    const src = esc(asset.webPath || '');
    let player = '';
    if (asset.type === 'audio') player = `<audio controls preload="metadata" src="${src}"></audio>`;
    else if (asset.type === 'video' || asset.type === 'animation') player = `<video controls preload="metadata" src="${src}"></video>`;
    else if (asset.type === 'image') player = `<img src="${src}" alt="${esc(assetTitle(asset))}">`;
    else player = '<span class="mf-muted">Keine Vorschau verfügbar.</span>';
    preview.innerHTML = `
      <div class="mf-preview-player">${player}</div>
      <div class="mf-preview-meta">
        <strong>${esc(assetTitle(asset))}</strong>
        <small>${esc(assetPath(asset))}</small>
        <code>mediaId=${esc(asset.id || '')}</code>
      </div>`;
  }

  function ensureBaseMarkup(root) {
    if (!root.querySelector('[data-media-field-open]')) {
      root.insertAdjacentHTML('beforeend', '<button type="button" data-media-field-open>Medium auswählen</button>');
    }
    if (!root.querySelector('[data-media-field-clear]')) {
      root.insertAdjacentHTML('beforeend', '<button type="button" data-media-field-clear>Entfernen</button>');
    }
    if (!root.querySelector('[data-media-field-preview]')) {
      root.insertAdjacentHTML('beforeend', '<div class="media-field-preview" data-media-field-preview><span class="mf-muted">Kein Medium ausgewählt.</span></div>');
    }
    if (!root.querySelector('[data-media-field-value]')) {
      root.insertAdjacentHTML('beforeend', '<input type="hidden" data-media-field-value value="">');
    }
  }

  function valueInput(root, config) {
    return findTarget(root, config.valueInput || root.dataset.valueInput || '') || root.querySelector('[data-media-field-value]');
  }

  function labelTarget(root, config) {
    return findTarget(root, config.labelTarget || root.dataset.labelTarget || '');
  }

  function updateValue(root, config, asset) {
    const input = valueInput(root, config);
    const label = labelTarget(root, config);
    if (input) {
      input.value = asset?.id ? String(asset.id) : '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (label) {
      label.textContent = asset ? `${assetTitle(asset)} (#${asset.id})` : 'Kein Medium ausgewählt';
    }
    root.dataset.mediaId = asset?.id ? String(asset.id) : '';
    renderPreview(root, asset || null);
    root.dispatchEvent(new CustomEvent('media-field:change', {
      bubbles: true,
      detail: { asset: asset || null, mediaId: asset?.id ? String(asset.id) : '' }
    }));
  }

  function configFromRoot(root, override = {}) {
    return {
      moduleKey: clean(override.moduleKey || root.dataset.moduleKey || 'general') || 'general',
      categoryKey: clean(override.categoryKey || root.dataset.categoryKey || ''),
      allowedTypes: Array.isArray(override.allowedTypes) ? override.allowedTypes : splitList(override.allowedTypes || root.dataset.allowedTypes || 'audio,video,image,animation'),
      title: clean(override.title || root.dataset.title || 'Medium auswählen'),
      valueInput: override.valueInput || root.dataset.valueInput || '',
      labelTarget: override.labelTarget || root.dataset.labelTarget || '',
      onSelect: typeof override.onSelect === 'function' ? override.onSelect : null,
      onClear: typeof override.onClear === 'function' ? override.onClear : null
    };
  }

  function attach(root, override = {}) {
    if (!root || root.__mediaFieldAttached) return root;
    ensureBaseMarkup(root);
    const config = configFromRoot(root, override);
    root.__mediaFieldAttached = true;
    root.__mediaFieldConfig = config;

    const openBtn = root.querySelector('[data-media-field-open]');
    const clearBtn = root.querySelector('[data-media-field-clear]');

    openBtn?.addEventListener('click', () => {
      if (!window.MediaPicker?.open) {
        updateValue(root, config, null);
        root.dispatchEvent(new CustomEvent('media-field:error', { bubbles: true, detail: { error: 'MediaPicker nicht geladen.' } }));
        return;
      }
      window.MediaPicker.open({
        title: config.title,
        moduleKey: config.moduleKey,
        categoryKey: config.categoryKey || undefined,
        allowedTypes: config.allowedTypes,
        onSelect(asset) {
          updateValue(root, config, asset);
          if (config.onSelect) config.onSelect(asset, root);
        }
      });
    });

    clearBtn?.addEventListener('click', () => {
      updateValue(root, config, null);
      if (config.onClear) config.onClear(root);
    });

    const initialMediaId = clean(valueInput(root, config)?.value || root.dataset.mediaId || '');
    if (initialMediaId) root.dataset.mediaId = initialMediaId;
    if (!root.querySelector('[data-media-field-preview]')?.innerHTML?.trim()) renderPreview(root, null);
    return root;
  }

  function initAll(scope = document) {
    const roots = Array.from(scope.querySelectorAll('[data-media-field]'));
    roots.forEach(root => attach(root));
    return roots.length;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initAll(document));
  else initAll(document);

  return { attach, initAll, updateValue };
})();
