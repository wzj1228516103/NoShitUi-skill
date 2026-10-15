/* FRAME · Original SVG poster editor. No third-party code or remote assets. */
'use strict';
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const STORAGE_KEY = 'noshitui.frame.draft.v1';
  const FONTS = { sans: 'Arial, Helvetica, sans-serif', serif: 'Georgia, "Times New Roman", serif', mono: '"Courier New", Courier, monospace' };
  const $ = id => document.getElementById(id);
  const svg = $('artboard');
  const clone = value => JSON.parse(JSON.stringify(value));
  const safeText = value => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '').slice(0, 180);
  const text = (id, name, content, x, y, size, color, weight = 400, font = 'sans', rotation = 0, tracking = 0) => ({ id, name, kind: 'text', text: content, x, y, size, color, weight, font, rotation, tracking, visible: true });
  const circle = (id, name, x, y, size, color) => ({ id, name, kind: 'circle', x, y, size, color, rotation: 0, visible: true });
  const templates = [
    {
      id: 'grid', name: 'Off the grid', subtitle: 'Bold type. No rules.', theme: 'SWISS / GEOMETRIC', background: '#eeece3',
      layers: [
        circle('signal', 'Signal circle', 458, 418, 342, '#ff5e32'),
        text('edition', 'Edition', 'INDEPENDENT DESIGN EXHIBITION', 38, 46, 11, '#282822', 700, 'mono', 0, 1.2),
        text('title', 'Main title', 'OFF\nTHE\nGRID', 29, 199, 139, '#21211d', 900, 'sans', 0, -8),
        text('date', 'Exhibition date', '24—26.10', 36, 647, 48, '#21211d', 700, 'sans', 0, -2.5),
        text('details', 'The invitation', 'A space for the unexpected.\nNew perspectives, from the outside in.', 40, 696, 12, '#424139', 400, 'mono', 0, -.15),
        text('entry', 'Entry details', 'STUDIO 04\nFREE ENTRY ↗', 431, 730, 11, '#282822', 700, 'mono')
      ]
    },
    {
      id: 'soft', name: 'Soft signals', subtitle: 'Let the feeling lead.', theme: 'GRADIENT / EDITORIAL', background: '#f6edee',
      layers: [
        circle('signal', 'Quiet sun', 413, 399, 226, '#e9f1c8'),
        text('edition', 'The series', 'CONVERSATIONS IN GOOD COMPANY', 42, 51, 10, '#534263', 700, 'mono', 0, 1),
        text('title', 'Main title', 'soft\nsignals', 36, 198, 112, '#463352', 400, 'serif', 0, -6),
        text('date', 'An invitation', 'A gathering for\nquieter ideas.', 41, 579, 30, '#463352', 400, 'serif', 0, -.6),
        text('details', 'Time and place', 'SUNDAY, OCTOBER 18\nTHE GLASSHOUSE / 14:00—18:00', 43, 691, 11, '#534263', 400, 'mono', 0, .1),
        text('entry', 'A gentle reminder', 'COME AS YOU ARE.', 43, 748, 10, '#534263', 700, 'mono', 0, 1.6)
      ]
    },
    {
      id: 'sunday', name: 'Sunday social', subtitle: 'A very good old time.', theme: 'RETRO / PRINT SHOP', background: '#ead7b5',
      layers: [
        circle('signal', 'Setting sun', 300, 430, 204, '#dc653e'),
        text('edition', 'Neighborhood note', 'YOUR NEIGHBORHOOD, TOGETHER.', 77, 57, 13, '#4d4939', 700, 'mono', 0, 1.1),
        text('title', 'Main title', 'Sunday\nSocial', 60, 179, 103, '#24574d', 700, 'serif', 0, -5),
        text('date', 'The occasion', 'GOOD FOOD. GOOD PEOPLE.', 89, 602, 14, '#4d4939', 700, 'mono', 0, .7),
        text('details', 'Time and place', 'OCTOBER 25 / 11AM — SUNSET\nRIVERSIDE PARK, EAST GATE', 92, 661, 13, '#4d4939', 400, 'mono', 0, .1),
        text('entry', 'Open invitation', 'EVERYONE IS SOMEONE HERE.', 99, 740, 12, '#24574d', 700, 'mono', 0, 1)
      ]
    }
  ];
  const makeDocument = template => ({ version: 1, templateId: template.id, layers: clone(template.layers) });
  let doc = makeDocument(templates[0]);
  let selectedId = 'title';
  let history = [];
  let historyIndex = 0;
  let savedSnapshot = '';
  let drag = null;
  let toastTimer;
  let exportBusy = false;
  let draftMessage = '';
  let draftError = false;

  const createSVG = (name, attributes = {}) => {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
    return node;
  };
  function getTemplate() { return templates.find(template => template.id === doc.templateId) || templates[0]; }
  function getSelected() { return doc.layers.find(layer => layer.id === selectedId); }
  function snapshot() { return JSON.stringify(doc); }
  function announce(message) { $('liveStatus').textContent = message; }
  function notify(message, type = 'success', duration = 4200) {
    clearTimeout(toastTimer);
    $('toastText').textContent = message;
    $('toastIcon').textContent = type === 'error' ? '!' : type === 'loading' ? '↗' : '✓';
    $('toast').className = `status-toast visible ${type}`;
    if (duration) toastTimer = setTimeout(() => $('toast').classList.remove('visible'), duration);
  }
  $('dismissToast').addEventListener('click', () => { clearTimeout(toastTimer); $('toast').classList.remove('visible'); });

  function addBackground(root, template, prefix) {
    const defs = createSVG('defs');
    const clip = createSVG('clipPath', { id: `${prefix}-clip` });
    clip.append(createSVG('rect', { width: 600, height: 780 }));
    defs.append(clip);
    root.append(defs, createSVG('rect', { width: 600, height: 780, fill: template.background }));
    const decoration = createSVG('g', { 'clip-path': `url(#${prefix}-clip)`, 'pointer-events': 'none', 'aria-hidden': 'true' });
    if (template.id === 'grid') {
      decoration.append(createSVG('line', { x1: 39, y1: 74, x2: 561, y2: 74, stroke: '#b6b5a7', 'stroke-width': 1 }));
      decoration.append(createSVG('line', { x1: 39, y1: 668, x2: 561, y2: 668, stroke: '#b6b5a7', 'stroke-width': 1 }));
      decoration.append(createSVG('line', { x1: 39, y1: 750, x2: 561, y2: 750, stroke: '#b6b5a7', 'stroke-width': 1 }));
      const label = createSVG('text', { x: 561, y: 46, fill: '#282822', 'font-size': 11, 'font-family': FONTS.mono, 'text-anchor': 'end' });
      label.textContent = '№ 026'; decoration.append(label);
      // The optical grid is intentionally part of the original artwork.
      for (let i = 0; i < 4; i++) decoration.append(createSVG('line', { x1: 398 + i * 44, y1: 546, x2: 398 + i * 44, y2: 579, stroke: '#858477', 'stroke-width': .6 }));
      decoration.append(createSVG('line', { x1: 398, y1: 562, x2: 530, y2: 562, stroke: '#858477', 'stroke-width': .6 }));
    } else if (template.id === 'soft') {
      const gradients = [
        { id: 'lavender', cx: '85%', cy: '36%', r: '80%', color: '#b7a1e8', opacity: .94 },
        { id: 'pink', cx: '16%', cy: '67%', r: '72%', color: '#eba9a9', opacity: .87 },
        { id: 'cream', cx: '74%', cy: '100%', r: '68%', color: '#f2e7b9', opacity: .9 }
      ];
      gradients.forEach(item => {
        const gradient = createSVG('radialGradient', { id: `${prefix}-${item.id}`, cx: item.cx, cy: item.cy, r: item.r });
        gradient.append(createSVG('stop', { offset: 0, 'stop-color': item.color, 'stop-opacity': item.opacity }), createSVG('stop', { offset: 1, 'stop-color': item.color, 'stop-opacity': 0 }));
        defs.append(gradient);
        decoration.append(createSVG('rect', { width: 600, height: 780, fill: `url(#${prefix}-${item.id})` }));
      });
      for (let i = 0; i < 9; i++) decoration.append(createSVG('ellipse', { cx: 414, cy: 400, rx: 135 + i * 16, ry: 154 + i * 16, fill: 'none', stroke: '#fbf5f3', 'stroke-width': .8, opacity: .48, transform: 'rotate(-25 414 400)' }));
      decoration.append(createSVG('line', { x1: 42, y1: 720, x2: 556, y2: 720, stroke: '#745b82', 'stroke-width': .6, opacity: .5 }));
      const star = createSVG('text', { x: 525, y: 750, fill: '#534263', 'font-family': FONTS.serif, 'font-size': 32 }); star.textContent = '✳'; decoration.append(star);
    } else {
      decoration.append(createSVG('rect', { x: 24, y: 24, width: 552, height: 732, rx: 242, fill: 'none', stroke: '#8b765b', 'stroke-width': 1.2 }));
      // Parallel arcs make a small, original two-color print illustration.
      for (let i = 0; i < 5; i++) decoration.append(createSVG('path', { d: `M 95 ${500 + i * 11} Q 198 ${428 + i * 8} 300 ${500 + i * 11} T 505 ${500 + i * 11}`, fill: 'none', stroke: '#24574d', 'stroke-width': 5 }));
      decoration.append(createSVG('path', { d: 'M 95 567 H 505', stroke: '#9f8a6c', 'stroke-width': 1 }));
      for (const x of [62, 538]) {
        decoration.append(createSVG('path', { d: `M ${x} 610 v 28 m -14 -14 h 28 m -24 -10 20 20 m -20 0 20 -20`, stroke: '#b36948', 'stroke-width': 1.3, fill: 'none' }));
      }
    }
    root.append(decoration);
  }

  function layerNode(layer, interactive) {
    const group = createSVG('g', { transform: `translate(${layer.x} ${layer.y}) rotate(${layer.rotation})`, 'data-layer-id': layer.id });
    if (!layer.visible) group.setAttribute('display', 'none');
    if (interactive) { group.setAttribute('aria-label', layer.name); }
    if (layer.kind === 'circle') group.append(createSVG('circle', { cx: 0, cy: 0, r: layer.size / 2, fill: layer.color }));
    else {
      const element = createSVG('text', { x: 0, y: 0, fill: layer.color, 'font-family': FONTS[layer.font], 'font-size': layer.size, 'font-weight': layer.weight, 'letter-spacing': layer.tracking || 0, 'xml:space': 'preserve' });
      const lines = layer.text.split('\n');
      lines.forEach((line, index) => { const span = createSVG('tspan', { x: 0, y: index * layer.size * .94 }); span.textContent = line || '\u00a0'; element.append(span); });
      group.append(element);
    }
    return group;
  }
  function populatePoster(root, documentState, prefix, interactive = false) {
    const template = templates.find(item => item.id === documentState.templateId) || templates[0];
    root.replaceChildren();
    addBackground(root, template, prefix);
    const layersGroup = createSVG('g', { 'clip-path': `url(#${prefix}-clip)` });
    documentState.layers.forEach(layer => layersGroup.append(layerNode(layer, interactive)));
    root.append(layersGroup);
  }
  function renderCanvas() {
    populatePoster(svg, doc, 'canvas', true);
    const layer = getSelected();
    if (!layer || !layer.visible) return;
    const group = [...svg.querySelectorAll('[data-layer-id]')].find(node => node.dataset.layerId === selectedId);
    if (!group) return;
    let bounds;
    try { bounds = group.getBBox(); } catch (_) { return; }
    const x = bounds.x - 7, y = bounds.y - 7, width = Math.max(bounds.width, 15) + 14, height = Math.max(bounds.height, 15) + 14;
    const overlay = createSVG('g', { class: 'selection-overlay', transform: group.getAttribute('transform'), 'aria-hidden': 'true', 'pointer-events': 'none' });
    overlay.append(createSVG('rect', { x, y, width, height, fill: 'none', stroke: '#9967ed', 'stroke-width': 1.2, 'vector-effect': 'non-scaling-stroke' }));
    for (const [cx, cy] of [[x, y], [x + width, y], [x, y + height], [x + width, y + height]]) overlay.append(createSVG('rect', { x: cx - 3.1, y: cy - 3.1, width: 6.2, height: 6.2, fill: '#fffefa', stroke: '#9967ed', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }));
    svg.append(overlay);
  }
  function renderTemplates() {
    $('templateList').replaceChildren();
    templates.forEach((template, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'template-card'; button.dataset.template = template.id;
      button.setAttribute('aria-pressed', String(template.id === doc.templateId)); button.setAttribute('aria-label', `${template.name}. ${template.subtitle}`);
      const preview = document.createElement('span'); preview.className = 'template-preview';
      const thumbnail = createSVG('svg', { viewBox: '0 0 600 780', width: 600, height: 780, 'aria-hidden': 'true' });
      populatePoster(thumbnail, makeDocument(template), `thumb-${index}`); preview.append(thumbnail);
      const copy = document.createElement('span'); copy.className = 'template-copy';
      const strong = document.createElement('strong'); strong.textContent = template.name;
      const small = document.createElement('small'); small.textContent = template.subtitle;
      copy.append(strong, small); button.append(preview, copy);
      if (template.id === doc.templateId) { const dot = document.createElement('span'); dot.className = 'template-active'; dot.setAttribute('aria-hidden', 'true'); button.append(dot); }
      button.addEventListener('click', () => {
        finishEdit(); if (doc.templateId === template.id) return;
        doc = makeDocument(template); selectedId = 'title'; commit(); renderAll(); notify(`${template.name} is on your canvas. Your previous design is one Undo away.`);
      });
      $('templateList').append(button);
    });
  }
  function renderLayers() {
    const list = $('layerList');
    const focused = document.activeElement;
    const focusedId = focused?.closest('[data-row-id]')?.dataset.rowId;
    const focusVisibility = focused?.classList.contains('visibility-button');
    list.replaceChildren();
    [...doc.layers].reverse().forEach(layer => {
      const row = document.createElement('div'); row.className = `layer-row${layer.id === selectedId ? ' selected' : ''}${layer.visible ? '' : ' is-hidden'}`; row.dataset.rowId = layer.id;
      const select = document.createElement('button'); select.type = 'button'; select.className = 'layer-select'; select.setAttribute('aria-pressed', String(layer.id === selectedId));
      const icon = document.createElement('span'); icon.className = 'layer-icon'; icon.textContent = layer.kind === 'text' ? 'T' : '○'; icon.setAttribute('aria-hidden', 'true');
      const copy = document.createElement('span'); copy.className = 'layer-copy';
      const name = document.createElement('strong'); name.textContent = layer.name;
      const sample = document.createElement('small'); sample.textContent = layer.kind === 'text' ? layer.text.replace(/\n/g, ' ') || 'Empty text layer' : 'Original geometry';
      copy.append(name, sample); select.append(icon, copy);
      select.addEventListener('click', () => { finishEdit(); selectedId = layer.id; renderCanvas(); renderLayers(); renderInspector(); announce(`${layer.name} selected.`); });
      const visible = document.createElement('button'); visible.type = 'button'; visible.className = 'visibility-button'; visible.setAttribute('aria-label', `${layer.visible ? 'Hide' : 'Show'} ${layer.name}`); visible.setAttribute('aria-pressed', String(layer.visible));
      const eye = createSVG('svg', { viewBox: '0 0 20 20', 'aria-hidden': 'true' });
      eye.append(createSVG('path', { d: layer.visible ? 'M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z' : 'M3 3l14 14M2 10s3-5 8-5c1.7 0 3.2.6 4.4 1.5M18 10s-3 5-8 5c-1.7 0-3.2-.6-4.4-1.5', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.2 }));
      if (layer.visible) eye.append(createSVG('circle', { cx: 10, cy: 10, r: 2, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.2 }));
      visible.append(eye); visible.addEventListener('click', () => { finishEdit(); layer.visible = !layer.visible; commit(); renderCanvas(); renderLayers(); updateDocumentInfo(); announce(`${layer.name} ${layer.visible ? 'shown' : 'hidden'}.`); });
      row.append(select, visible); list.append(row);
    });
    $('layerCount').textContent = String(doc.layers.length).padStart(2, '0');
    if (focusedId) {
      const row = [...list.children].find(node => node.dataset.rowId === focusedId);
      row?.querySelector(focusVisibility ? '.visibility-button' : '.layer-select')?.focus({ preventScroll: true });
    }
  }
  function setValue(id, value) { if (document.activeElement !== $(id)) $(id).value = value; }
  function renderInspector() {
    const layer = getSelected();
    $('propertyForm').hidden = !layer; $('emptySelection').hidden = Boolean(layer);
    $('selectionName').textContent = layer?.name || 'Your composition';
    $('selectionType').textContent = !layer ? '↖' : layer.kind === 'text' ? 'T' : '○';
    $('selectionDescription').textContent = !layer ? 'A space for your next idea.' : layer.kind === 'text' ? 'Make a little noise.' : 'A little shape. A lot of character.';
    if (!layer) return;
    const isText = layer.kind === 'text';
    $('textControls').hidden = !isText;
    $('weightField').hidden = !isText;
    $('fontInput').hidden = !isText;
    document.querySelector('label[for="fontInput"]').hidden = !isText;
    $('typeControls').querySelector('h3').textContent = isText ? 'TYPOGRAPHY' : 'GEOMETRY';
    $('typeControls').querySelector('.section-heading>span').textContent = isText ? 'Aa' : '○';
    $('sizeLabel').textContent = isText ? 'Size' : 'Diameter';
    $('sizeInput').max = isText ? 260 : 700;
    setValue('textInput', layer.text || ''); setValue('fontInput', layer.font || 'sans'); setValue('weightInput', layer.weight || 400);
    setValue('sizeInput', layer.size); setValue('xInput', layer.x); setValue('yInput', layer.y); setValue('rotationInput', layer.rotation); setValue('colorInput', layer.color);
    $('colorLabel').textContent = layer.color.toUpperCase();
  }
  function updateDocumentInfo() {
    const template = getTemplate(); const index = templates.indexOf(template);
    $('documentTitle').textContent = template.name;
    $('canvasName').textContent = String(index + 1).padStart(2, '0');
    document.querySelector('.template-section .section-heading>span').textContent = `${String(index + 1).padStart(2, '0')} / 03`;
    document.querySelector('.artboard-tag').textContent = `FRAME — ${String(index + 1).padStart(3, '0')}`;
    const clean = snapshot() === savedSnapshot;
    $('saveState').className = clean ? 'saved' : '';
    const dot = document.createElement('i'); $('saveState').replaceChildren(dot, document.createTextNode(clean ? ' Saved on this device' : ' Unsaved draft'));
    $('undoButton').disabled = historyIndex <= 0;
    $('redoButton').disabled = historyIndex >= history.length - 1;
    $('addText').disabled = doc.layers.length >= 30;
  }
  function renderAll() { renderCanvas(); renderTemplates(); renderLayers(); renderInspector(); updateDocumentInfo(); updateZoom(); }
  function commit() {
    const current = snapshot();
    if (current === history[historyIndex]) return;
    history = history.slice(0, historyIndex + 1); history.push(current);
    if (history.length > 80) history.shift();
    historyIndex = history.length - 1; updateDocumentInfo();
  }
  function finishEdit() { if (!drag) commit(); }
  function travelHistory(direction) {
    finishEdit(); const next = historyIndex + direction;
    if (next < 0 || next >= history.length) return;
    historyIndex = next; doc = JSON.parse(history[historyIndex]);
    if (!getSelected()) selectedId = doc.layers.find(layer => layer.kind === 'text')?.id || null;
    renderAll(); announce(direction < 0 ? 'Last change undone.' : 'Change redone.');
  }
  $('undoButton').addEventListener('click', () => travelHistory(-1));
  $('redoButton').addEventListener('click', () => travelHistory(1));
  $('resetButton').addEventListener('click', () => {
    finishEdit(); doc = makeDocument(getTemplate()); selectedId = 'title'; commit(); renderAll(); notify('A fresh start. Template restored — Undo brings your edits back.');
  });
  $('propertyForm').addEventListener('submit', event => event.preventDefault());
  const numericFields = { sizeInput: 'size', xInput: 'x', yInput: 'y', rotationInput: 'rotation' };
  $('propertyForm').addEventListener('input', event => {
    const layer = getSelected(); if (!layer) return;
    const field = event.target;
    if (field.id === 'textInput') layer.text = safeText(field.value);
    else if (field.id === 'fontInput' && FONTS[field.value]) layer.font = field.value;
    else if (field.id === 'weightInput' && [400, 600, 700, 900].includes(Number(field.value))) layer.weight = Number(field.value);
    else if (field.id === 'colorInput' && /^#[0-9a-f]{6}$/i.test(field.value)) layer.color = field.value;
    else if (numericFields[field.id]) {
      if (!field.validity.valid || field.value.trim() === '') return;
      layer[numericFields[field.id]] = Math.round(Number(field.value));
    } else return;
    renderCanvas(); renderLayers(); renderInspector(); updateDocumentInfo();
  });
  $('propertyForm').addEventListener('change', event => {
    if (numericFields[event.target.id] && (!event.target.validity.valid || event.target.value.trim() === '')) {
      notify(`Use a value between ${event.target.min} and ${event.target.max}.`, 'error'); event.target.value = getSelected()?.[numericFields[event.target.id]] ?? '';
    }
    finishEdit();
  });
  $('propertyForm').addEventListener('focusout', () => finishEdit());
  $('addText').addEventListener('click', () => {
    finishEdit(); if (doc.layers.length >= 30) return;
    const id = `text-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    doc.layers.push(text(id, 'Your words', 'Something good.', 55, 390, 42, getTemplate().id === 'soft' ? '#463352' : '#21211d', 700));
    selectedId = id; commit(); renderAll(); setMobilePanel('edit'); $('textInput').focus({ preventScroll: true }); $('textInput').select(); notify('A new text layer. Say something good.');
  });
  function deleteSelected() {
    finishEdit(); const selected = getSelected(); if (!selected) return;
    doc.layers = doc.layers.filter(layer => layer.id !== selectedId); selectedId = doc.layers.at(-1)?.id || null;
    commit(); renderAll();
    // Deleting the final layer hides its form; keep keyboard focus meaningful.
    if (!getSelected()) { $('selectionName').tabIndex = -1; $('selectionName').focus({ preventScroll: true }); }
    notify(`${selected.name} deleted. Undo will bring it back.`);
  }
  $('deleteLayer').addEventListener('click', deleteSelected);
  function canvasPoint(event) {
    const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    const matrix = svg.getScreenCTM(); return matrix ? point.matrixTransform(matrix.inverse()) : null;
  }
  svg.addEventListener('pointerdown', event => {
    if (event.button !== 0 || exportBusy) return;
    finishEdit();
    const target = event.target.closest('[data-layer-id]');
    if (!target) { selectedId = null; renderCanvas(); renderLayers(); renderInspector(); return; }
    const layer = doc.layers.find(item => item.id === target.dataset.layerId); if (!layer) return;
    selectedId = layer.id; const point = canvasPoint(event); if (!point) return;
    drag = { pointerId: event.pointerId, start: point, x: layer.x, y: layer.y, moved: false };
    svg.setPointerCapture(event.pointerId); svg.focus({ preventScroll: true });
    event.preventDefault(); renderCanvas(); renderLayers(); renderInspector();
  });
  svg.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const layer = getSelected(), point = canvasPoint(event); if (!layer || !point) return;
    layer.x = Math.round(Math.max(-600, Math.min(1200, drag.x + point.x - drag.start.x)));
    layer.y = Math.round(Math.max(-780, Math.min(1560, drag.y + point.y - drag.start.y)));
    drag.moved = true; renderCanvas(); renderInspector(); updateDocumentInfo();
  });
  function stopDrag(event) {
    if (!drag || (event && event.pointerId !== drag.pointerId)) return;
    const moved = drag.moved; const pointerId = drag.pointerId; drag = null;
    if (svg.hasPointerCapture(pointerId)) svg.releasePointerCapture(pointerId);
    commit(); if (moved) announce(`${getSelected()?.name || 'Layer'} moved. X ${getSelected()?.x}, Y ${getSelected()?.y}.`);
  }
  svg.addEventListener('pointerup', stopDrag); svg.addEventListener('pointercancel', stopDrag); svg.addEventListener('lostpointercapture', stopDrag);
  window.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveDraft(); return; }
    const editing = event.target.closest('input, textarea, select, [contenteditable]');
    if (editing) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); travelHistory(event.shiftKey ? 1 : -1); return; }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); travelHistory(1); return; }
    if (document.activeElement !== svg || !getSelected()) return;
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); deleteSelected(); return; }
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const direction = directions[event.key]; if (!direction) return;
    event.preventDefault(); finishEdit(); const layer = getSelected(); const step = event.shiftKey ? 10 : 1;
    layer.x = Math.max(-600, Math.min(1200, layer.x + direction[0] * step)); layer.y = Math.max(-780, Math.min(1560, layer.y + direction[1] * step));
    commit(); renderCanvas(); renderInspector(); updateDocumentInfo(); announce(`${layer.name}: X ${layer.x}, Y ${layer.y}.`);
  });

  function validateDraft(value) {
    if (!value || value.version !== 1 || !templates.some(item => item.id === value.templateId) || !Array.isArray(value.layers) || value.layers.length > 30) throw new Error('Invalid draft');
    const ids = new Set();
    const validated = value.layers.map(layer => {
      if (!layer || typeof layer.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(layer.id) || ids.has(layer.id)) throw new Error('Invalid layer');
      ids.add(layer.id);
      if (!['text', 'circle'].includes(layer.kind) || typeof layer.name !== 'string' || layer.name.length > 70 || !/^#[0-9a-f]{6}$/i.test(layer.color)) throw new Error('Invalid layer');
      if (![layer.x, layer.y, layer.size, layer.rotation].every(Number.isFinite) || layer.x < -600 || layer.x > 1200 || layer.y < -780 || layer.y > 1560 || layer.rotation < -180 || layer.rotation > 180 || layer.size < 8 || layer.size > (layer.kind === 'text' ? 260 : 700) || typeof layer.visible !== 'boolean') throw new Error('Invalid position');
      const result = { id: layer.id, name: layer.name, kind: layer.kind, x: layer.x, y: layer.y, size: layer.size, color: layer.color, rotation: layer.rotation, visible: layer.visible };
      if (layer.kind === 'text') {
        if (typeof layer.text !== 'string' || layer.text.length > 180 || !Object.hasOwn(FONTS, layer.font) || ![400, 600, 700, 900].includes(layer.weight)) throw new Error('Invalid text');
        result.text = safeText(layer.text); result.font = layer.font; result.weight = layer.weight; result.tracking = Number.isFinite(layer.tracking) ? Math.max(-10, Math.min(10, layer.tracking)) : 0;
      }
      return result;
    });
    return { version: 1, templateId: value.templateId, layers: validated };
  }
  function saveDraft() {
    finishEdit();
    try { localStorage.setItem(STORAGE_KEY, snapshot()); savedSnapshot = snapshot(); updateDocumentInfo(); notify('Draft saved on this device. It will be here when you come back.'); }
    catch (_) { notify('Your browser could not save this draft. Export an SVG to keep your design.', 'error', 6500); }
  }
  $('saveButton').addEventListener('click', saveDraft);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      if (stored.length > 70000) throw new Error('Draft too large');
      doc = validateDraft(JSON.parse(stored)); selectedId = doc.layers.find(layer => layer.id === 'title')?.id || doc.layers.at(-1)?.id || null;
      savedSnapshot = snapshot(); draftMessage = 'Welcome back. Your saved draft is on the canvas.';
    }
  } catch (_) { draftMessage = 'The saved draft could not be read. A fresh template is ready; export an SVG to keep a copy.'; draftError = true; }
  history = [snapshot()];

  function exportedSVG() {
    finishEdit();
    const output = createSVG('svg', { xmlns: NS, viewBox: '0 0 600 780', width: 600, height: 780 });
    populatePoster(output, doc, 'frame-export');
    output.querySelectorAll('[data-layer-id]').forEach(node => node.removeAttribute('data-layer-id'));
    const title = createSVG('title'); title.textContent = `FRAME — ${getTemplate().name}`; output.prepend(title);
    // XMLSerializer escapes user text, including markup, ampersands, and quotes.
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(output)}`;
  }
  function downloadBlob(blob, extension) {
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `frame-${getTemplate().id}.${extension}`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  $('exportSVG').addEventListener('click', () => {
    try { downloadBlob(new Blob([exportedSVG()], { type: 'image/svg+xml;charset=utf-8' }), 'svg'); notify('SVG exported. Your type and shapes stay editable.'); }
    catch (_) { notify('SVG export did not complete. Please try again; your canvas is still here.', 'error'); }
  });
  $('exportPNG').addEventListener('click', async () => {
    if (exportBusy) return;
    exportBusy = true; const button = $('exportPNG'); button.disabled = true; button.setAttribute('aria-busy', 'true');
    notify('Rendering your poster at 1200 × 1560 px…', 'loading', 0);
    let sourceURL;
    try {
      const source = exportedSVG();
      sourceURL = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
      const image = new Image();
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error('Image rendering failed')); image.src = sourceURL; });
      const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1560;
      const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas is unavailable');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('PNG encoding failed')), 'image/png'));
      downloadBlob(blob, 'png'); notify('PNG exported at 2×. Go make a little impression.');
    } catch (_) { notify('PNG export could not finish in this browser. Try Download editable SVG instead.', 'error', 6500); }
    finally { if (sourceURL) URL.revokeObjectURL(sourceURL); exportBusy = false; button.disabled = false; button.removeAttribute('aria-busy'); }
  });
  function setMobilePanel(panel, scroll = true) {
    if (!['templates', 'layers', 'edit'].includes(panel)) return;
    document.body.dataset.mobilePanel = panel;
    document.querySelectorAll('[data-panel]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.panel === panel)));
    if (scroll && window.matchMedia('(max-width: 680px)').matches) $(`${panel}Panel`).scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
  document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => setMobilePanel(button.dataset.panel)));
  function updateZoom() {
    // Fit both axes, including narrow screens where width is the limiting edge.
    const area = $('canvasArea'), style = getComputedStyle(area);
    const availableWidth = Math.max(1, area.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    const availableHeight = Math.max(1, area.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom));
    const width = Math.min(availableWidth, availableHeight * 600 / 780);
    const surround = document.querySelector('.artboard-surround');
    surround.style.width = `${width}px`; surround.style.height = `${width * 780 / 600}px`;
    $('zoomLabel').textContent = `${Math.round(width / 600 * 100)}% · FIT`;
  }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => updateZoom()).observe($('canvasArea'));
  else window.addEventListener('resize', updateZoom);
  renderAll();
  if (draftMessage) notify(draftMessage, draftError ? 'error' : 'success', 5500);
})();
