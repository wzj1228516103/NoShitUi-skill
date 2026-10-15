(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const STORAGE_KEY = 'node-flow-studio-v1';
  const TYPES = {
    source: { name: 'Text source', kind: 'INPUT', icon: 'source', detail: 'A little context to start with.', defaults: { text: 'A good idea starts with a little context. Add your own words here.' } },
    clean: { name: 'Clean up', kind: 'TRANSFORM', icon: 'clean', detail: 'Trim whitespace and adjust the case.', defaults: { casing: 'preserve' } },
    summary: { name: 'Summarize', kind: 'TRANSFORM', icon: 'summary', detail: 'Keep the first few complete sentences.', defaults: { sentences: 2 } },
    sentiment: { name: 'Read the tone', kind: 'TRANSFORM', icon: 'sentiment', detail: 'A transparent, word-based tone signal.', defaults: { includeOriginal: true } },
    format: { name: 'Format text', kind: 'TRANSFORM', icon: 'format', detail: 'A considered format for your words.', defaults: { style: 'bullets', heading: 'THE WEEKLY DIGEST' } },
    output: { name: 'Output', kind: 'OUTPUT', icon: 'output', detail: 'Send the result to your local preview.', defaults: {} }
  };
  const copy = value => JSON.parse(JSON.stringify(value));
  const node = (id, type, label, x, y, params = {}) => ({ id, type, label, x, y, params: { ...TYPES[type].defaults, ...params } });
  const edge = (id, from, to) => ({ id, from, to });
  const TEMPLATES = {
    digest: () => ({ name: 'The weekly digest', template: 'digest', nodes: [
      node('context', 'source', 'A little context', 55, 210, { text: 'We opened the studio doors on a rainy Tuesday. The new collection brings together thoughtful tools and quieter ways to work. Every piece is made to give good ideas a little more room. Our community helped shape the details.' }),
      node('summary', 'summary', 'Keep the good parts', 310, 110),
      node('format', 'format', 'Make it a digest', 565, 110),
      node('preview', 'output', 'Ready to share', 565, 315)
    ], edges: [edge('context-summary', 'context', 'summary'), edge('summary-format', 'summary', 'format'), edge('format-preview', 'format', 'preview')] }),
    reviews: () => ({ name: 'A room for feedback', template: 'reviews', nodes: [
      node('review', 'source', 'A thoughtful review', 55, 210, { text: 'Love the new design. The experience is excellent and easy to use. The slow export was frustrating, but the support was helpful.' }),
      node('tidy', 'clean', 'Find the signal', 310, 110),
      node('tone', 'sentiment', 'A little perspective', 565, 110),
      node('feedback', 'output', 'Feedback, considered', 565, 315)
    ], edges: [edge('review-tidy', 'review', 'tidy'), edge('tidy-tone', 'tidy', 'tone'), edge('tone-feedback', 'tone', 'feedback')] }),
    press: () => ({ name: 'A small announcement', template: 'press', nodes: [
      node('notes', 'source', 'The studio notes', 55, 110, { text: '  FIELD NOTES opens this Saturday.   A small exhibition of objects, sketches, and ideas collected along the way. Everyone is welcome to stop by the studio between ten and six. Come as you are, and stay a little longer.  ' }),
      node('clean-notes', 'clean', 'A little less noise', 310, 110),
      node('short-note', 'summary', 'One good sentence', 565, 110, { sentences: 1 }),
      node('announcement', 'format', 'The announcement', 565, 315, { style: 'paragraph', heading: 'ONE SMALL ANNOUNCEMENT' }),
      node('press-preview', 'output', 'Off the press', 310, 315)
    ], edges: [edge('notes-clean', 'notes', 'clean-notes'), edge('clean-short', 'clean-notes', 'short-note'), edge('short-announcement', 'short-note', 'announcement'), edge('announcement-preview', 'announcement', 'press-preview')] })
  };

  let graph = TEMPLATES.digest();
  let restored = false;
  let storageNotice = '';
  let selection = { kind: 'node', id: 'summary' };
  let connectingFrom = null;
  let zoom = 1;
  let dirty = false;
  let runToken = 0;
  let isRunning = false;
  let startTime = 0;
  let serial = 0;
  let toastTimer;
  let drag = null;
  const statuses = new Map();
  const results = new Map();
  let issues = [];
  let output = '';

  function sanitizePayload(payload) {
    if (!payload || payload.version !== 1 || !payload.graph || typeof payload.graph !== 'object') throw new Error('Unknown saved format');
    const g = payload.graph;
    if (!Array.isArray(g.nodes) || g.nodes.length > 30 || !Array.isArray(g.edges) || g.edges.length > 60) throw new Error('Invalid saved graph');
    const ids = new Set();
    const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(id);
    const nodes = g.nodes.map(n => {
      if (!n || !validId(n.id) || ids.has(n.id) || !Object.hasOwn(TYPES, n.type) || !Number.isFinite(n.x) || !Number.isFinite(n.y)) throw new Error('Invalid saved node');
      ids.add(n.id);
      const p = n.params && typeof n.params === 'object' ? n.params : {};
      let params = {};
      if (n.type === 'source') params = { text: typeof p.text === 'string' ? p.text.slice(0, 6000) : '' };
      if (n.type === 'clean') params = { casing: ['preserve', 'lower', 'upper'].includes(p.casing) ? p.casing : 'preserve' };
      if (n.type === 'summary') params = { sentences: [1, 2, 3].includes(p.sentences) ? p.sentences : 2 };
      if (n.type === 'sentiment') params = { includeOriginal: p.includeOriginal !== false };
      if (n.type === 'format') params = { style: ['bullets', 'numbers', 'paragraph'].includes(p.style) ? p.style : 'bullets', heading: typeof p.heading === 'string' ? p.heading.slice(0, 60) : '' };
      return { id: n.id, type: n.type, label: typeof n.label === 'string' ? n.label.slice(0, 48) : TYPES[n.type].name, x: Math.max(8, Math.min(3200, n.x)), y: Math.max(8, Math.min(3200, n.y)), params };
    });
    const edgeIds = new Set();
    const targets = new Set();
    const edges = g.edges.map(e => {
      if (!e || !validId(e.id) || edgeIds.has(e.id) || !ids.has(e.from) || !ids.has(e.to) || e.from === e.to || targets.has(e.to)) throw new Error('Invalid saved connection');
      const from = nodes.find(n => n.id === e.from), to = nodes.find(n => n.id === e.to);
      if (from.type === 'output' || to.type === 'source') throw new Error('Invalid saved port');
      edgeIds.add(e.id); targets.add(e.to);
      return { id: e.id, from: e.from, to: e.to };
    });
    return { name: typeof g.name === 'string' ? g.name.slice(0, 64) : 'Untitled workflow', template: Object.hasOwn(TEMPLATES, g.template) ? g.template : 'digest', nodes, edges };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { graph = sanitizePayload(JSON.parse(raw)); restored = true; selection = { kind: 'node', id: graph.nodes.find(n => n.type === 'summary')?.id || graph.nodes[0]?.id || '' }; }
  } catch { storageNotice = 'The saved flow could not be read. A fresh example is ready; it has not overwritten your saved data.'; }

  const getNode = id => graph.nodes.find(n => n.id === id);
  const getEdge = id => graph.edges.find(e => e.id === id);
  const newId = prefix => `${prefix}-${Date.now().toString(36)}-${(++serial).toString(36)}`;
  function el(tag, className, text) { const item = document.createElement(tag); if (className) item.className = className; if (text !== undefined) item.textContent = text; return item; }
  function icon(name) { const svg = document.createElementNS(NS, 'svg'); const use = document.createElementNS(NS, 'use'); use.setAttribute('href', `#n-${name}`); svg.append(use); svg.setAttribute('aria-hidden', 'true'); return svg; }
  function typeIcon(type) { const wrap = el('span', `type-icon ${type}`); wrap.append(icon(TYPES[type].icon)); return wrap; }
  function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').classList.add('show'); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3300); }
  function setPanel(panel) { $('workspace').dataset.panel = panel; document.querySelectorAll('.mobile-panels [data-panel]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.panel === panel))); }
  function smallScreen() { return window.matchMedia('(max-width: 900px)').matches; }

  function appendLog(kind, message, nodeId) {
    const row = el('li', `log-entry ${kind}`);
    const seconds = startTime ? Math.floor((performance.now() - startTime) / 1000) : 0;
    row.append(el('time', '', `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`));
    if (nodeId && getNode(nodeId)) { const button = el('button', '', message); button.addEventListener('click', () => { selectNode(nodeId); if (smallScreen()) setPanel('inspector'); }); row.append(button); }
    else row.append(el('span', '', message));
    const list = $('logList'); list.append(row);
    while (list.children.length > 80) list.firstChild.remove();
    list.scrollTop = list.scrollHeight;
  }

  function clearExecution() {
    statuses.clear(); results.clear(); issues = []; output = '';
    $('inspectorContent').querySelector('.last-result')?.remove();
    $('runStatus').textContent = 'NOT RUN YET';
    $('outputText').textContent = 'Your next good idea ends up here. Run the workflow to see it take shape.';
    $('outputText').classList.add('is-empty'); $('copyOutputButton').disabled = true;
  }
  function markChanged() {
    dirty = true;
    if (statuses.size || results.size || issues.length) clearExecution();
    $('saveState').textContent = 'Unsaved changes'; $('saveState').classList.add('unsaved');
    $('footerStatus').textContent = 'A little progress. Save it when you are ready.';
  }

  function updateWorld() {
    const width = Math.max(1050, ...graph.nodes.map(n => n.x + 260));
    const height = Math.max(650, ...graph.nodes.map(n => n.y + 200));
    $('canvasStage').style.width = `${width}px`; $('canvasStage').style.height = `${height}px`;
    $('canvasStage').style.transform = `scale(${zoom})`;
    $('stageSize').style.width = `${width * zoom}px`; $('stageSize').style.height = `${height * zoom}px`;
    $('connections').setAttribute('viewBox', `0 0 ${width} ${height}`);
    $('zoomValue').textContent = `${Math.round(zoom * 100)}%`;
    $('zoomOut').disabled = zoom <= .6; $('zoomIn').disabled = zoom >= 1.4;
  }

  function drawConnections() {
    const svg = $('connections'); svg.replaceChildren();
    graph.edges.forEach(e => {
      const from = getNode(e.from), to = getNode(e.to); if (!from || !to) return;
      const sx = from.x + 202, sy = from.y + 86, tx = to.x, ty = to.y + 86;
      const offset = Math.max(60, Math.abs(tx - sx) * .46);
      const path = document.createElementNS(NS, 'path');
      let className = 'connection-path';
      if (selection.kind === 'edge' && selection.id === e.id) className += ' selected';
      if (statuses.get(e.to) === 'running') className += ' running';
      else if (results.has(e.to)) className += ' completed';
      path.setAttribute('class', className); path.dataset.edge = e.id;
      path.setAttribute('d', `M ${sx} ${sy} C ${sx + offset} ${sy}, ${tx - offset} ${ty}, ${tx} ${ty}`);
      path.addEventListener('click', event => { event.stopPropagation(); selectEdge(e.id); if (smallScreen()) setPanel('inspector'); });
      svg.append(path);
    });
  }

  function nodePreview(n) {
    if (results.has(n.id)) return results.get(n.id).slice(0, 95);
    if (n.type === 'source') return n.params.text.slice(0, 95) || 'Your words go here…';
    if (n.type === 'summary') return `${n.params.sentences} sentence${n.params.sentences === 1 ? '' : 's'} · Extractive summary\nKeep what matters. Leave a little room.`;
    if (n.type === 'clean') return `Whitespace → tidy\nLetter case → ${n.params.casing}`;
    if (n.type === 'sentiment') return 'Positive / neutral / negative\nA simple, transparent word count.';
    if (n.type === 'format') return `${n.params.heading || 'NO HEADING'}\n${{ bullets: '• A little structure', numbers: '1. A little structure', paragraph: 'Words, given a little breathing room.' }[n.params.style]}`;
    return 'A place for the finished thought.\nRun your flow to see it here.';
  }

  function renderNodes() {
    const focused = document.activeElement;
    const focusedNode = focused?.closest?.('[data-node-id]')?.dataset.nodeId;
    const focusedPort = focused?.dataset?.port;
    const focusedGrip = focused?.classList?.contains('node-grip');
    $('nodes').replaceChildren();
    graph.nodes.forEach(n => {
      const card = el('article', 'node-card'); card.dataset.nodeId = n.id; card.style.left = `${n.x}px`; card.style.top = `${n.y}px`;
      const grip = el('button', 'node-grip'); grip.type = 'button'; grip.setAttribute('aria-label', `Select ${n.label || TYPES[n.type].name}. Use arrow keys to move; Shift moves one pixel.`); grip.setAttribute('aria-describedby', 'canvasHelp');
      const titles = el('span'); titles.append(el('span', 'node-title', n.label || TYPES[n.type].name), el('span', 'node-kind', TYPES[n.type].kind));
      grip.append(typeIcon(n.type), titles); const handle = icon('grip'); handle.classList.add('node-handle'); grip.append(handle);
      grip.addEventListener('click', () => selectNode(n.id));
      grip.addEventListener('dblclick', () => { selectNode(n.id); if (smallScreen()) setPanel('inspector'); $('param-label')?.focus(); });
      grip.addEventListener('pointerdown', event => beginDrag(event, n.id));
      grip.addEventListener('keydown', event => {
        const changes = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        if (!Object.hasOwn(changes, event.key) || isRunning) return;
        event.preventDefault(); selectNode(n.id); const amount = event.shiftKey ? 1 : 10;
        n.x = Math.max(8, Math.min(3200, n.x + changes[event.key][0] * amount)); n.y = Math.max(8, Math.min(3200, n.y + changes[event.key][1] * amount));
        markChanged(); renderNodes(); drawConnections();
      });
      const body = el('div', 'node-body'); body.append(el('div', 'node-preview', nodePreview(n)));
      const footer = el('div', 'node-footer'); footer.append(el('span', '', n.type === 'source' ? 'TEXT / SOURCE' : n.type === 'output' ? 'TEXT / PREVIEW' : 'TEXT → TEXT'), el('span', 'node-state', 'READY'));
      card.append(grip, body, footer);
      if (n.type !== 'source') card.append(makePort(n, 'input'));
      if (n.type !== 'output') card.append(makePort(n, 'output'));
      card.addEventListener('click', event => { if (!event.target.closest('button')) selectNode(n.id); });
      $('nodes').append(card);
    });
    $('graphCount').textContent = `${graph.nodes.length} node${graph.nodes.length === 1 ? '' : 's'} · ${graph.edges.length} connection${graph.edges.length === 1 ? '' : 's'}`;
    updateWorld(); updateSelectionStyles(); lockControls();
    if (focusedNode && (focusedPort || focusedGrip)) {
      const card = Array.from($('nodes').children).find(item => item.dataset.nodeId === focusedNode);
      const replacement = focusedPort ? card?.querySelector(`[data-port="${focusedPort}"]`) : card?.querySelector('.node-grip');
      replacement?.focus({ preventScroll: true });
    }
  }

  function makePort(n, direction) {
    const button = el('button', `port port-${direction}`); button.type = 'button'; button.dataset.port = direction;
    button.setAttribute('aria-label', `${direction === 'output' ? 'Choose output from' : 'Connect input of'} ${n.label || TYPES[n.type].name}`);
    button.dataset.mutation = ''; if (direction === 'output') button.setAttribute('aria-pressed', String(connectingFrom === n.id));
    button.addEventListener('click', event => { event.stopPropagation(); usePort(n.id, direction); });
    return button;
  }

  function updateSelectionStyles() {
    $('nodes').querySelectorAll('.node-card').forEach(card => {
      const id = card.dataset.nodeId, selected = selection.kind === 'node' && selection.id === id;
      card.classList.toggle('selected', selected); card.classList.toggle('has-issue', issues.some(issue => issue.nodeId === id));
      ['running', 'success', 'error', 'cancelled'].forEach(status => card.classList.toggle(`is-${status}`, statuses.get(id) === status));
      card.querySelector('.node-grip').setAttribute('aria-pressed', String(selected));
      card.querySelector('.node-state').textContent = ({ running: 'RUNNING', success: 'COMPLETE', error: 'REVIEW', cancelled: 'CANCELLED', waiting: 'WAITING' })[statuses.get(id)] || (issues.some(issue => issue.nodeId === id) ? 'REVIEW' : 'READY');
      card.querySelector('[data-port=output]')?.setAttribute('aria-pressed', String(connectingFrom === id));
    });
    $('deleteSelectionButton').disabled = isRunning || !(selection.kind === 'node' ? getNode(selection.id) : getEdge(selection.id));
    $('connectionHint').hidden = !connectingFrom;
    if (connectingFrom) $('connectionHintText').textContent = `From ${getNode(connectingFrom)?.label || 'output'} → choose an input port.`;
  }

  function selectNode(id) { if (!getNode(id)) return; selection = { kind: 'node', id }; updateSelectionStyles(); drawConnections(); renderInspector(); }
  function selectEdge(id) { if (!getEdge(id)) return; const fromInspector = $('inspectorContent').contains(document.activeElement); selection = { kind: 'edge', id }; updateSelectionStyles(); drawConnections(); renderInspector(); if (fromInspector) $('removeConnectionButton')?.focus({ preventScroll: true }); }
  function cancelConnection() { connectingFrom = null; updateSelectionStyles(); }
  function usePort(id, direction) {
    if (isRunning) return;
    if (direction === 'output') { connectingFrom = connectingFrom === id ? null : id; selectNode(id); updateSelectionStyles(); return; }
    if (!connectingFrom) { toast('First choose an output port, then this input.'); return; }
    if (connectingFrom === id) { toast('A step cannot connect to itself. Choose a different input.'); return; }
    if (graph.edges.some(e => e.from === connectingFrom && e.to === id)) { toast('Those two steps are already connected.'); cancelConnection(); return; }
    const replaces = graph.edges.some(e => e.to === id);
    graph.edges = graph.edges.filter(e => e.to !== id);
    graph.edges.push(edge(newId('wire'), connectingFrom, id));
    connectingFrom = null; markChanged(); selectNode(id); renderNodes(); drawConnections(); renderInspector();
    toast(replaces ? 'Input reconnected. The previous connection was replaced.' : 'One more useful connection.');
  }

  function beginDrag(event, id) {
    if (event.button !== 0) return;
    selectNode(id);
    if (isRunning) return;
    const n = getNode(id);
    drag = { id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: n.x, y: n.y, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  window.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId || isRunning) return;
    const n = getNode(drag.id); if (!n) return;
    const dx = (event.clientX - drag.startX) / zoom, dy = (event.clientY - drag.startY) / zoom;
    if (!drag.moved && Math.hypot(dx, dy) < 3) return;
    if (!drag.moved) { markChanged(); drag.moved = true; updateSelectionStyles(); }
    n.x = Math.max(8, Math.min(3200, drag.x + dx)); n.y = Math.max(8, Math.min(3200, drag.y + dy));
    const card = Array.from($('nodes').children).find(item => item.dataset.nodeId === n.id);
    card.style.left = `${n.x}px`; card.style.top = `${n.y}px`; updateWorld(); drawConnections();
  });
  function finishDrag() { if (drag?.moved) renderInspector(); drag = null; }
  window.addEventListener('pointerup', finishDrag); window.addEventListener('pointercancel', finishDrag);

  function field(label, input, help) {
    const wrap = el('div', 'field'), caption = el('label', '', label); caption.htmlFor = input.id; input.dataset.mutation = ''; wrap.append(caption, input); if (help) wrap.append(el('small', '', help)); return wrap;
  }
  function inputControl(id, value, max) { const input = el('input'); input.id = id; input.value = value; if (max) input.maxLength = max; return input; }
  function selectControl(id, value, options) { const select = el('select'); select.id = id; options.forEach(([key, label]) => { const option = el('option', '', label); option.value = key; option.selected = key === String(value); select.append(option); }); return select; }
  function changeParam(n, key, value) { if (isRunning) return; n.params[key] = value; markChanged(); renderNodes(); drawConnections(); }

  function renderInspector() {
    const container = $('inspectorContent'); container.replaceChildren();
    if (selection.kind === 'edge') {
      const e = getEdge(selection.id); if (!e) return;
      const heading = el('div', 'inspector-node-heading'); const detail = el('div'); detail.append(el('h3', '', 'A useful connection'), el('small', '', 'TEXT / ONE WAY')); const badge = el('span', 'type-icon clean'); badge.append(icon('connection')); heading.append(badge, detail); container.append(heading);
      container.append(el('p', 'edge-description', `${getNode(e.from).label} → ${getNode(e.to).label}`), el('p', 'inspector-note', 'The result of the first step becomes the input of the next. Each input accepts one connection.'));
      const remove = el('button', 'button inspector-delete', 'Remove connection'); remove.dataset.mutation = ''; remove.id = 'removeConnectionButton'; remove.addEventListener('click', () => deleteEdge(e.id)); container.append(remove); lockControls(); return;
    }
    const n = getNode(selection.id);
    if (!n) { container.append(el('p', 'inspector-empty', 'Select a step on the canvas. Its little details will appear here.'), el('p', 'inspector-note', 'Add a text source and an output to begin. The building blocks are on the left, or in the Add nodes panel on a phone.')); return; }
    const heading = el('div', 'inspector-node-heading'), headingText = el('div'); headingText.append(el('h3', '', TYPES[n.type].name), el('small', '', `${TYPES[n.type].kind} / ${n.id.slice(-12).toUpperCase()}`)); heading.append(typeIcon(n.type), headingText); container.append(heading);
    const label = inputControl('param-label', n.label, 48); label.addEventListener('input', () => { n.label = label.value; markChanged(); renderNodes(); drawConnections(); }); container.append(field('Step name', label));
    if (n.type === 'source') {
      const text = el('textarea'); text.id = 'param-text'; text.value = n.params.text; text.maxLength = 6000; text.addEventListener('input', () => changeParam(n, 'text', text.value)); container.append(field('A little context', text, 'Up to 6,000 characters. These words stay in this browser.'));
    }
    if (n.type === 'clean') {
      const casing = selectControl('param-case', n.params.casing, [['preserve', 'Keep the original case'], ['lower', 'all lowercase'], ['upper', 'ALL UPPERCASE']]); casing.addEventListener('change', () => changeParam(n, 'casing', casing.value)); container.append(field('Letter case', casing, 'Whitespace is trimmed and repeated spaces become one.'));
    }
    if (n.type === 'summary') {
      const sentences = selectControl('param-sentences', n.params.sentences, [['1', '1 sentence — just the essentials'], ['2', '2 sentences — a little context'], ['3', '3 sentences — room to breathe']]); sentences.addEventListener('change', () => changeParam(n, 'sentences', Number(sentences.value))); container.append(field('Keep how much?', sentences, 'A local extractive summary keeps the first complete sentences. No language model is called.'));
    }
    if (n.type === 'sentiment') {
      const wrap = el('label', 'check-field'); const check = el('input'); check.type = 'checkbox'; check.id = 'param-original'; check.checked = n.params.includeOriginal; check.dataset.mutation = ''; check.addEventListener('change', () => changeParam(n, 'includeOriginal', check.checked)); wrap.append(check, el('span', '', 'Include the original words below the tone signal.')); container.append(wrap, el('p', 'inspector-note', 'Counts a small list of positive and negative English words. This is a transparent simulation, not a judgment about a person.'));
    }
    if (n.type === 'format') {
      const style = selectControl('param-style', n.params.style, [['bullets', 'A few thoughtful bullet points'], ['numbers', 'One thing after another'], ['paragraph', 'A quiet paragraph']]); style.addEventListener('change', () => changeParam(n, 'style', style.value)); const title = inputControl('param-heading', n.params.heading, 60); title.addEventListener('input', () => changeParam(n, 'heading', title.value)); container.append(field('Text layout', style), field('A heading, if you like', title, 'Leave this empty for just the words.'));
    }
    if (n.type === 'output') container.append(el('p', 'inspector-note', 'This step writes the finished text to Preview output below. Nothing is published, sent, or uploaded.'));
    container.append(el('div', 'inspector-divider'), el('h4', 'inspector-section-title', 'CONNECTIONS'));
    const list = el('div', 'connection-list'); const related = graph.edges.filter(e => e.from === n.id || e.to === n.id);
    if (!related.length) list.append(el('p', 'inspector-empty', 'Nothing connected yet. Choose an output on the canvas, then an input.'));
    related.forEach(e => {
      const row = el('div', 'connection-item'), button = el('button', '', `${getNode(e.from).label || 'Step'} → ${getNode(e.to).label || 'Step'}`); button.dataset.selectEdge = e.id; button.setAttribute('aria-label', `Select connection from ${getNode(e.from).label} to ${getNode(e.to).label}`); button.addEventListener('click', () => selectEdge(e.id)); const remove = el('button', 'connection-remove'); remove.dataset.mutation = ''; remove.dataset.deleteEdge = e.id; remove.setAttribute('aria-label', `Remove connection from ${getNode(e.from).label} to ${getNode(e.to).label}`); remove.append(icon('close')); remove.addEventListener('click', () => deleteEdge(e.id)); row.append(button, remove); list.append(row);
    }); container.append(list);
    if (results.has(n.id)) { const result = el('section', 'last-result'); result.append(el('div', 'inspector-divider'), el('h4', 'inspector-section-title', 'LAST STEP RESULT'), el('pre', 'node-result', results.get(n.id))); container.append(result); }
    const remove = el('button', 'button inspector-delete'); remove.append(icon('trash'), document.createTextNode('Remove this step')); remove.id = 'removeNodeButton'; remove.dataset.mutation = ''; remove.addEventListener('click', () => deleteNode(n.id)); container.append(remove);
    lockControls();
  }

  function lockControls() {
    document.querySelectorAll('[data-mutation]').forEach(control => { control.disabled = isRunning; });
    document.querySelectorAll('[data-add]').forEach(control => { control.disabled = isRunning || graph.nodes.length >= 30; });
    $('validateButton').disabled = isRunning; $('clearLogButton').disabled = isRunning;
    $('runButton').hidden = isRunning; $('cancelRunButton').hidden = !isRunning;
    $('deleteSelectionButton').disabled = isRunning || !(selection.kind === 'node' ? getNode(selection.id) : getEdge(selection.id));
  }
  function renderAll() { $('workflowName').value = graph.name; $('templateSelect').value = graph.template; renderNodes(); drawConnections(); renderInspector(); }
  function focusSelection() {
    if (smallScreen() && $('workspace').dataset.panel === 'inspector') { $('param-label')?.focus(); return; }
    const card = Array.from($('nodes').children).find(item => item.dataset.nodeId === selection.id);
    (card?.querySelector('.node-grip') || $('canvasViewport')).focus({ preventScroll: true });
  }
  function addNode(type) {
    if (isRunning || !Object.hasOwn(TYPES, type) || graph.nodes.length >= 30) return;
    let position = { x: 55, y: 45 };
    for (let index = 0; index < 100; index++) {
      const candidate = { x: 55 + (index % 4) * 255, y: 45 + Math.floor(index / 4) * 190 };
      if (!graph.nodes.some(n => Math.abs(n.x - candidate.x) < 230 && Math.abs(n.y - candidate.y) < 170)) { position = candidate; break; }
    }
    const n = node(newId('step'), type, TYPES[type].name, position.x, position.y); graph.nodes.push(n); selection = { kind: 'node', id: n.id }; connectingFrom = null;
    markChanged(); renderAll(); if (smallScreen()) setPanel('canvas');
    requestAnimationFrame(() => { const card = Array.from($('nodes').children).find(item => item.dataset.nodeId === n.id); card?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); focusSelection(); });
    toast(`${TYPES[type].name} added. Connect it, then make it your own.`);
  }
  function deleteNode(id) { if (isRunning || !getNode(id)) return; const label = getNode(id).label; graph.nodes = graph.nodes.filter(n => n.id !== id); graph.edges = graph.edges.filter(e => e.from !== id && e.to !== id); if (connectingFrom === id) connectingFrom = null; selection = { kind: 'node', id: graph.nodes[0]?.id || '' }; markChanged(); renderAll(); focusSelection(); toast(`${label || 'Step'} removed with its connections.`); }
  function deleteEdge(id) { if (isRunning || !getEdge(id)) return; const e = getEdge(id); graph.edges = graph.edges.filter(item => item.id !== id); if (selection.kind === 'edge') selection = { kind: 'node', id: e.to }; markChanged(); renderAll(); focusSelection(); toast('Connection removed. The steps are still here.'); }
  function deleteSelection() { if (selection.kind === 'edge') deleteEdge(selection.id); else deleteNode(selection.id); }

  function validateGraph() {
    const found = [], ids = new Set(graph.nodes.map(n => n.id));
    const add = (message, nodeId) => found.push({ message, nodeId });
    const sources = graph.nodes.filter(n => n.type === 'source'), outputs = graph.nodes.filter(n => n.type === 'output');
    if (!sources.length) add('Add a text source. Every flow needs a beginning.');
    if (!outputs.length) add('Add an output. Give the result somewhere to go.');
    const incoming = new Map(graph.nodes.map(n => [n.id, []])), outgoing = new Map(graph.nodes.map(n => [n.id, []]));
    graph.edges.forEach(e => {
      if (!ids.has(e.from) || !ids.has(e.to)) { add('A connection points to a missing step.'); return; }
      incoming.get(e.to).push(e.from); outgoing.get(e.from).push(e.to);
    });
    graph.nodes.forEach(n => {
      const label = n.label.trim() || TYPES[n.type].name;
      if (!n.label.trim()) add('Give this step a name.', n.id);
      if (n.type === 'source' && !n.params.text.trim()) add(`${label}: add some source text.`, n.id);
      if (n.type !== 'source' && incoming.get(n.id).length === 0) add(`${label}: connect an input.`, n.id);
      if (incoming.get(n.id).length > 1) add(`${label}: use just one input connection.`, n.id);
      if (!incoming.get(n.id).length && !outgoing.get(n.id).length) add(`${label}: this step is isolated.`, n.id);
    });
    const indegree = new Map(graph.nodes.map(n => [n.id, incoming.get(n.id).length]));
    const ready = graph.nodes.filter(n => indegree.get(n.id) === 0).map(n => n.id), order = [];
    while (ready.length) { const id = ready.shift(); order.push(id); outgoing.get(id).forEach(next => { indegree.set(next, indegree.get(next) - 1); if (indegree.get(next) === 0) ready.push(next); }); }
    const cycle = graph.nodes.filter(n => !order.includes(n.id));
    if (cycle.length) add(`A cycle stops the flow near ${cycle[0].label || TYPES[cycle[0].type].name}. Remove a returning connection.`, cycle[0].id);
    const reachable = new Set(sources.map(n => n.id)); let queue = [...reachable];
    while (queue.length) { const id = queue.shift(); outgoing.get(id).forEach(next => { if (!reachable.has(next)) { reachable.add(next); queue.push(next); } }); }
    const reachesOutput = new Set(outputs.map(n => n.id)); queue = [...reachesOutput];
    while (queue.length) { const id = queue.shift(); incoming.get(id).forEach(prev => { if (!reachesOutput.has(prev)) { reachesOutput.add(prev); queue.push(prev); } }); }
    graph.nodes.forEach(n => {
      if (!reachable.has(n.id) && incoming.get(n.id).length) add(`${n.label || TYPES[n.type].name}: no path from a source.`, n.id);
      if (!reachesOutput.has(n.id) && outgoing.get(n.id).length && !cycle.some(item => item.id === n.id)) add(`${n.label || TYPES[n.type].name}: this branch never reaches an output.`, n.id);
      if (n.type !== 'output' && !outgoing.get(n.id).length && incoming.get(n.id).length) add(`${n.label || TYPES[n.type].name}: connect this step to an output path.`, n.id);
    });
    return { issues: found, order };
  }

  function showValidation(notify = true) {
    const validation = validateGraph(); issues = validation.issues;
    if (issues.length) { $('runStatus').textContent = `${issues.length} THING${issues.length === 1 ? '' : 'S'} TO FIX`; issues.slice(0, 15).forEach(issue => appendLog('error', issue.message, issue.nodeId)); $('footerStatus').textContent = 'A few connections need your attention.'; if (notify) toast(`${issues.length} thing${issues.length === 1 ? '' : 's'} to fix. Follow the execution log.`); }
    else { $('runStatus').textContent = 'VALIDATED'; appendLog('success', `All ${graph.nodes.length} steps connected. Your flow is ready.`); $('footerStatus').textContent = 'All good. Ready to give it a run.'; if (notify) toast('All good. Every step has somewhere to go.'); }
    updateSelectionStyles(); drawConnections(); return validation;
  }
  function sentences(text) { return text.match(/[^.!?。！？\n]+[.!?。！？]*/g)?.map(s => s.trim()).filter(Boolean) || [text.trim()]; }
  function processNode(n, input) {
    if (n.type === 'source') return n.params.text.trim();
    if (n.type === 'clean') { let text = input.replace(/\s+/g, ' ').trim(); if (n.params.casing === 'lower') text = text.toLowerCase(); if (n.params.casing === 'upper') text = text.toUpperCase(); return text; }
    if (n.type === 'summary') return sentences(input).slice(0, n.params.sentences).join(' ');
    if (n.type === 'sentiment') {
      const words = input.toLowerCase().match(/[a-z]+/g) || [];
      const positive = new Set(['love', 'great', 'good', 'excellent', 'easy', 'helpful', 'beautiful', 'happy', 'thoughtful', 'amazing', 'wonderful', 'best']);
      const negative = new Set(['bad', 'poor', 'slow', 'frustrating', 'hate', 'broken', 'difficult', 'terrible', 'awful', 'disappointing', 'worst']);
      const up = words.filter(w => positive.has(w)).length, down = words.filter(w => negative.has(w)).length;
      const tone = up > down ? 'Positive' : down > up ? 'Negative' : 'Neutral';
      return `Tone: ${tone} (${up} positive / ${down} negative word signals).${n.params.includeOriginal ? `\n\n${input}` : ''}`;
    }
    if (n.type === 'format') {
      const lines = sentences(input); let text = input.trim();
      if (n.params.style === 'bullets') text = lines.map(line => `• ${line}`).join('\n');
      if (n.params.style === 'numbers') text = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
      return `${n.params.heading.trim() ? `${n.params.heading.trim()}\n\n` : ''}${text}`;
    }
    return input;
  }

  async function runWorkflow() {
    if (isRunning) return;
    startTime = performance.now(); $('logList').replaceChildren(); clearExecution();
    const validation = showValidation(false);
    if (validation.issues.length) { toast('A few steps need attention before this flow can run.'); return; }
    const token = ++runToken; isRunning = true; cancelConnection(); statuses.clear(); graph.nodes.forEach(n => statuses.set(n.id, 'waiting')); renderNodes(); drawConnections(); renderInspector();
    $('runStatus').textContent = 'RUNNING / SIMULATED'; $('footerStatus').textContent = 'A small idea, making its way through.'; $('cancelRunButton').focus({ preventScroll: true });
    appendLog('neutral', 'Local simulation started. No external services are called.');
    try {
      for (const id of validation.order) {
        if (token !== runToken) return;
        const n = getNode(id); statuses.set(id, 'running'); updateSelectionStyles(); drawConnections(); appendLog('running', `Running ${n.label || TYPES[n.type].name}…`, id);
        await new Promise(resolve => setTimeout(resolve, 650));
        if (token !== runToken) return;
        const parent = graph.edges.find(e => e.to === id); const input = parent ? results.get(parent.from) || '' : '';
        const result = processNode(n, input); results.set(id, result); statuses.set(id, 'success');
        if (n.type === 'output') { output = result; $('outputText').textContent = output || '(Empty output)'; $('outputText').classList.remove('is-empty'); $('copyOutputButton').disabled = !output; }
        renderNodes(); drawConnections(); renderInspector(); appendLog('success', `${n.label || TYPES[n.type].name} complete · ${result.length} characters`, id);
      }
      if (token !== runToken) return;
      isRunning = false; lockControls(); $('runStatus').textContent = 'COMPLETED'; $('footerStatus').textContent = 'One good thought, a little more considered.'; appendLog('success', `Finished ${validation.order.length} steps in ${((performance.now() - startTime) / 1000).toFixed(1)}s. Your preview is ready.`); toast('A little flow. A finished thought.');
      if (document.activeElement === $('cancelRunButton')) $('runButton').focus({ preventScroll: true });
    } catch { if (token !== runToken) return; isRunning = false; statuses.forEach((value, id) => { if (value === 'running') statuses.set(id, 'error'); }); lockControls(); updateSelectionStyles(); $('runStatus').textContent = 'RUN INTERRUPTED'; appendLog('error', 'This local simulation was interrupted. Validate your flow, then try again.'); toast('The flow paused unexpectedly. Your work is still here.'); }
  }

  function cancelRun() { if (!isRunning) return; runToken++; isRunning = false; statuses.forEach((value, id) => { if (value === 'running') statuses.set(id, 'cancelled'); else if (value === 'waiting') statuses.delete(id); }); lockControls(); updateSelectionStyles(); drawConnections(); renderInspector(); $('runStatus').textContent = 'CANCELLED'; $('footerStatus').textContent = 'Run cancelled. Your workflow is still here.'; appendLog('neutral', 'Run cancelled. Finished steps remain available to inspect.'); $('runButton').focus({ preventScroll: true }); toast('No rush. The run has been cancelled.'); }
  function payload() { return { version: 1, simulation: true, graph: copy({ ...graph, name: graph.name.trim() || 'Untitled workflow' }) }; }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload())); dirty = false; $('saveState').textContent = 'Saved in this browser'; $('saveState').classList.remove('unsaved'); $('footerStatus').textContent = 'Your steps will be here when you return.'; toast('Saved in this browser. A little progress, kept.'); } catch { $('saveState').textContent = 'Storage unavailable'; $('saveState').classList.add('unsaved'); toast('This browser could not save. Export JSON to keep your workflow.'); } }
  function exportJSON() { const blob = new Blob([JSON.stringify(payload(), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = el('a'); anchor.href = url; anchor.download = `${graph.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'node-workflow'}.json`; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500); toast('Your workflow, in a tidy JSON file.'); }
  function loadTemplate(id, reset = false) { if (isRunning || !Object.hasOwn(TEMPLATES, id)) return; graph = TEMPLATES[id](); selection = { kind: 'node', id: graph.nodes.find(n => n.type === 'summary')?.id || graph.nodes[0].id }; connectingFrom = null; zoom = 1; clearExecution(); markChanged(); renderAll(); $('canvasViewport').scrollTo(0, 0); if (smallScreen()) setPanel('canvas'); appendLog('neutral', `${reset ? 'Reset to' : 'Loaded'} ${graph.name}. Make it your own.`); toast(reset ? 'A fresh canvas. The editorial example is ready.' : 'A different starting point. Yours to connect.'); }

  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => addNode(button.dataset.add)));
  document.querySelectorAll('.mobile-panels [data-panel]').forEach(button => button.addEventListener('click', () => setPanel(button.dataset.panel)));
  $('workflowName').addEventListener('input', event => { graph.name = event.target.value; markChanged(); });
  $('saveButton').addEventListener('click', save); $('exportButton').addEventListener('click', exportJSON);
  $('loadTemplateButton').addEventListener('click', () => loadTemplate($('templateSelect').value));
  $('resetButton').addEventListener('click', () => { try { localStorage.removeItem(STORAGE_KEY); } catch { /* Reset works even without storage. */ } loadTemplate('digest', true); });
  $('validateButton').addEventListener('click', () => showValidation()); $('runButton').addEventListener('click', runWorkflow); $('cancelRunButton').addEventListener('click', cancelRun);
  $('deleteSelectionButton').addEventListener('click', deleteSelection); $('cancelConnectionButton').addEventListener('click', cancelConnection);
  $('zoomOut').addEventListener('click', () => { zoom = Math.max(.6, Math.round((zoom - .1) * 10) / 10); updateWorld(); });
  $('zoomIn').addEventListener('click', () => { zoom = Math.min(1.4, Math.round((zoom + .1) * 10) / 10); updateWorld(); });
  $('centerCanvas').addEventListener('click', () => { $('canvasViewport').scrollTo(0, 0); });
  $('clearLogButton').addEventListener('click', () => { $('logList').replaceChildren(); startTime = 0; appendLog('neutral', 'A little room for the next run.'); });
  $('copyOutputButton').addEventListener('click', async () => { if (!output) return; try { await navigator.clipboard.writeText(output); toast('The finished thought is on your clipboard.'); } catch { toast('Select the preview text and copy it with your keyboard.'); const selectionRange = window.getSelection(); const range = document.createRange(); range.selectNodeContents($('outputText')); selectionRange.removeAllRanges(); selectionRange.addRange(range); } });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && connectingFrom) { event.preventDefault(); cancelConnection(); return; }
    if (!(event.target instanceof Element) || event.target.closest('input,textarea,select,[contenteditable=true]')) return;
    if ((event.key === 'Delete' || event.key === 'Backspace') && !isRunning && event.target.closest('#workspace')) { event.preventDefault(); deleteSelection(); }
  });
  window.addEventListener('pagehide', () => { finishDrag(); if (isRunning) cancelRun(); });
  renderAll();
  if (restored) { $('saveState').textContent = 'Restored from this browser'; appendLog('neutral', 'Your saved workflow is back. Nothing runs until you press Run.'); }
  if (storageNotice) { appendLog('error', storageNotice); toast('A fresh example is ready. Saved data could not be read.'); }
})();
