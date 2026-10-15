'use strict';
(() => {
  const $ = id => document.getElementById(id), KEY = 'noshitui.source.preferences.v1';
  const docs = [
    { id: 'quickstart', title: 'Quickstart', category: 'GETTING STARTED', icon: '↗', lead: 'A clear path from your first request to your first message. Build a little confidence before you build something bigger.', sections: [
      { id: 'before-you-begin', title: 'Before you begin', paragraphs: ['Parcel is a fictional messaging API created for this interactive documentation demo. Its model is intentionally small: a project groups messages, and a message carries a recipient and a short body.', 'The request examples use api.parcel.example, a placeholder domain. To run a request here, use the local playground below. It uses in-memory data and never sends a network request.'], callout: ['A useful place to experiment', 'The public token sk_demo_local works only in this browser simulation. You do not need an account, a real API key, or a server.'] },
      { id: 'first-request', title: 'Make your first request', paragraphs: ['Choose POST /v1/messages in the playground. Keep the test token, enter prj_studio as your project, and add an email recipient and a message body between 1 and 280 characters.', 'A successful create request returns 201 Created. The returned message ID can then be used with GET /v1/messages/{id} during the same page session.'], table: [['FIELD', 'TYPE', 'DESCRIPTION'], ['project_id', 'string', 'Use the demo project prj_studio.'], ['recipient', 'string', 'An email-shaped address, such as hello@example.com.'], ['body', 'string', 'A non-empty message, up to 280 characters.']] },
      { id: 'read-response', title: 'Understand the response', paragraphs: ['The response includes an id, project_id, recipient, body, and status. A new demo message has the status queued. This sandbox stores it in memory; it does not deliver email or update delivery status.', 'Request validation is part of the interface. Try an empty body, a different token, or an unknown message ID to see a structured error with an HTTP-style status code.'], code: '{\n  "id": "msg_002",\n  "project_id": "prj_studio",\n  "recipient": "hello@example.com",\n  "body": "Your weekly brief is ready.",\n  "status": "queued"\n}', links: [['authentication', 'Authentication', 'Understand the test token and headers.'], ['messages', 'Create a message', 'Explore the request fields and validation.']] }
    ] },
    { id: 'authentication', title: 'Authentication', category: 'GETTING STARTED', icon: '⌑', lead: 'One header, one clear expectation. Every request in this API model uses a bearer token.', sections: [
      { id: 'bearer-token', title: 'Use a bearer token', paragraphs: ['Send the token in the Authorization header, prefixed with Bearer and one space. All three supported endpoints require authentication.', 'The local playground accepts exactly sk_demo_local. This is a public demonstration value, not a secret. Do not paste a production credential into this example page.'], code: 'Authorization: Bearer sk_demo_local\nContent-Type: application/json', callout: ['A deliberately local example', 'The playground reads the token field directly. The code samples show how the same value would appear in an HTTP request.'] },
      { id: 'unauthorized', title: 'Handle an unauthorized response', paragraphs: ['An empty or unrecognized token returns 401 with the code invalid_token. Authentication is checked before the endpoint parameters, so a request with both an invalid token and an invalid body returns 401 first.', 'Use the 401 Bad token preset in the playground to inspect this response. Restore the public demo token to continue.'], code: '{\n  "error": {\n    "code": "invalid_token",\n    "message": "Use the public demo token sk_demo_local."\n  }\n}', links: [['errors', 'Errors & responses', 'Read the complete response model.'], ['projects', 'List projects', 'Try a small authenticated GET request.']] }
    ] },
    { id: 'projects', title: 'List projects', category: 'API REFERENCE', icon: '▣', method: 'GET', endpoint: '/v1/projects', lead: 'Projects keep related messages together. In this sandbox, one small studio is all you need to get started.', sections: [
      { id: 'project-object', title: 'The project object', paragraphs: ['A project has a stable id and a human-readable name. The local demonstration includes one fixed project, prj_studio. It is available for the duration of every page session.'], table: [['PROPERTY', 'TYPE', 'DESCRIPTION'], ['id', 'string', 'Stable project identifier. The demo uses prj_studio.'], ['name', 'string', 'A display name: Independent Studio.']] },
      { id: 'list-request', title: 'List your projects', paragraphs: ['Send an authenticated GET /v1/projects request. No request body or query parameters are required. In the playground, choose this endpoint and press Send request.', 'The response is a list envelope with a data array. This demonstration does not implement pagination or project creation.'], code: '{\n  "object": "list",\n  "data": [\n    { "id": "prj_studio", "name": "Independent Studio" }\n  ]\n}', links: [['messages', 'Create a message', 'Use this project ID in a new message.'], ['authentication', 'Authentication', 'Every endpoint uses the bearer header.']] }
    ] },
    { id: 'messages', title: 'Create a message', category: 'API REFERENCE', icon: '↥', method: 'POST', endpoint: '/v1/messages', lead: 'Start with a recipient and something useful to say. Parcel returns the message object so you can follow what you created.', sections: [
      { id: 'request-body', title: 'Request body', paragraphs: ['The create endpoint expects a JSON object containing project_id, recipient, and body. The playground builds this object from its labeled fields.', 'The body is trimmed before validation. It must contain at least one non-whitespace character and at most 280 characters. The recipient receives a simple email-format check; this is not a deliverability check.'], table: [['FIELD', 'REQUIRED', 'DESCRIPTION'], ['project_id', 'Yes', 'The existing demo project, prj_studio.'], ['recipient', 'Yes', 'A simple email address such as hello@example.com.'], ['body', 'Yes', 'Between 1 and 280 characters after trimming.']] },
      { id: 'created-message', title: 'A successful create', paragraphs: ['A successful request returns 201 and a new message with status queued. IDs increase from msg_002 as you create messages. Use the returned ID in the retrieve endpoint to read the same object.', 'Messages stay in memory until the page reloads. They are not sent to recipients and do not consume any account quota.'], callout: ['Nothing leaves this page', 'You can use fictional addresses. The demo creates a local JavaScript object rather than sending a message.'] },
      { id: 'validation', title: 'When validation fails', paragraphs: ['An unknown project returns 404 project_not_found. With a valid project, an invalid recipient or empty/oversized body returns 400 validation_error. The error includes a field property when one field needs attention.', 'A failed request does not create a message. Fix the field and send a new request.'], links: [['retrieve', 'Retrieve a message', 'Read what you just created.'], ['errors', 'Errors & responses', 'Know what each status is telling you.']] }
    ] },
    { id: 'retrieve', title: 'Retrieve a message', category: 'API REFERENCE', icon: '↓', method: 'GET', endpoint: '/v1/messages/{id}', lead: 'A stable identifier makes a small API predictable. Ask for one message and receive that message, or a clear explanation.', sections: [
      { id: 'message-id', title: 'Find the message ID', paragraphs: ['The create response contains an id such as msg_002. Enter that value in the playground message_id field after choosing GET /v1/messages/{id}.', 'The sandbox also includes msg_001, a seeded message available on every reload. It gives you a predictable first GET request without creating anything.'], table: [['PARAMETER', 'LOCATION', 'DESCRIPTION'], ['message_id', 'path', 'The exact ID returned when a message was created.']] },
      { id: 'retrieve-response', title: 'Read one message', paragraphs: ['An existing ID returns 200 and the complete message object. A missing or unknown ID returns 404 message_not_found.', 'Data is local to the current page session. A message created in another tab or before a reload is not available here.'], code: '{\n  "id": "msg_001",\n  "project_id": "prj_studio",\n  "recipient": "hello@example.com",\n  "body": "A small beginning.",\n  "status": "queued"\n}', links: [['messages', 'Create a message', 'Create another object in this session.'], ['errors', 'Errors & responses', 'Understand a missing resource.']] }
    ] },
    { id: 'errors', title: 'Errors & responses', category: 'API REFERENCE', icon: '!', lead: 'An error should tell you what happened and what to do next. The sandbox uses a small, consistent response shape.', sections: [
      { id: 'status-codes', title: 'Read the status code', paragraphs: ['A 2xx result means the simulated request succeeded. A 4xx result means the input or credentials need attention. The sandbox implements the following codes; it does not simulate a real rate limiter or network outages.'], table: [['STATUS', 'MEANING', 'NEXT STEP'], ['200', 'OK', 'Read the retrieved message or project list.'], ['201', 'Created', 'Keep the new message ID for a retrieve request.'], ['400', 'Validation error', 'Correct the field named in the error.'], ['401', 'Invalid token', 'Restore sk_demo_local in the token field.'], ['404', 'Not found', 'Check the project or message identifier.']] },
      { id: 'error-shape', title: 'The error object', paragraphs: ['Error responses contain an error object with a machine-readable code and a human-readable message. Field validation errors also identify the field.'], code: '{\n  "error": {\n    "code": "validation_error",\n    "message": "Add a message body between 1 and 280 characters.",\n    "field": "body"\n  }\n}' },
      { id: 'cancel-request', title: 'Cancel a request', paragraphs: ['Each playground request has a short simulated delay so you can inspect its loading state. Press Cancel during that delay to stop the operation.', 'A cancelled request does not create a message and does not return an HTTP-style status. The response panel shows a local cancellation notice. You can edit the inputs and send again.'], links: [['quickstart', 'Back to the beginning', 'Make your first successful request.'], ['authentication', 'Authentication', 'Check the token before checking the body.']] }
    ] }
  ];
  let current = 'quickstart', language = 'js', activeRequest = null, responseObject = null, toastTimer, searchQuery = '', messageCounter = 1;
  const messages = new Map([['msg_001', { id: 'msg_001', project_id: 'prj_studio', recipient: 'hello@example.com', body: 'A small beginning.', status: 'queued' }]]);
  function node(tag, className, text) { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; }
  function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').classList.add('visible'); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4200); }
  function savePreferences() { try { localStorage.setItem(KEY, JSON.stringify({ version: 1, document: current, language })); } catch (_) { /* Reading and simulation remain usable when storage is blocked. */ } }
  try { const stored = localStorage.getItem(KEY); if (stored && stored.length < 1000) { const value = JSON.parse(stored); if (value?.version === 1 && docs.some(doc => doc.id === value.document) && ['js', 'python', 'curl'].includes(value.language)) { current = value.document; language = value.language; } } } catch (_) { /* Ignore invalid preferences. */ }
  const getDoc = () => docs.find(doc => doc.id === current) || docs[0];
  const smooth = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  function highlight(parent, content, query) {
    if (!query) { parent.append(document.createTextNode(content)); return; }
    const lower = content.toLowerCase(), term = query.toLowerCase(); let index = 0, at;
    while ((at = lower.indexOf(term, index)) !== -1) { parent.append(document.createTextNode(content.slice(index, at)), node('mark', '', content.slice(at, at + query.length))); index = at + query.length; }
    parent.append(document.createTextNode(content.slice(index)));
  }
  function linkTo(docId, sectionId, label) {
    const anchor = node('a', '', label); anchor.href = `#${docId}--${sectionId}`;
    anchor.addEventListener('click', event => { event.preventDefault(); showDoc(docId, sectionId, '', true); }); return anchor;
  }
  function renderNavigation() {
    for (const target of [$('desktopNav'), $('mobileNav')]) {
      target.replaceChildren(); let category = '';
      docs.forEach(doc => {
        if (doc.category !== category) { category = doc.category; target.append(node('div', 'nav-label', category)); }
        const button = node('button', 'doc-nav-button'); button.type = 'button'; button.dataset.document = doc.id;
        if (doc.id === current) button.setAttribute('aria-current', 'page');
        button.append(node('span', 'nav-icon', doc.icon), document.createTextNode(doc.title));
        if (doc.method) button.append(node('span', `nav-method ${doc.method.toLowerCase()}`, doc.method));
        button.addEventListener('click', () => { closeMenu(); showDoc(doc.id, null, '', true); }); target.append(button);
      });
      target.append(node('div', 'nav-label', 'BUILD WITH CONFIDENCE'));
      const playground = node('button', 'playground-nav-button'); playground.type = 'button'; playground.append(node('span', 'nav-icon', '⌘'), document.createTextNode('API Playground')); playground.addEventListener('click', () => { closeMenu(); openPlayground(); }); target.append(playground);
    }
  }
  function renderArticle(query = '') {
    const doc = getDoc(), article = $('articleContent'); article.replaceChildren();
    const crumbs = node('div', 'article-breadcrumb'); crumbs.append(node('span', '', 'Documentation'), node('span', '', '/'), node('span', '', doc.category === 'GETTING STARTED' ? 'Getting started' : 'API reference'));
    const heading = node('h1'); heading.id = 'documentHeading'; heading.tabIndex = -1; highlight(heading, doc.title, query);
    const lead = node('p', 'article-lead'); highlight(lead, doc.lead, query);
    const meta = node('div', 'article-meta'); meta.append(document.createTextNode('PARCEL API / VERSION 1.0'), node('span'), document.createTextNode('LOCAL EXAMPLE'));
    article.append(crumbs, node('span', 'eyebrow', doc.category), heading, lead);
    if (doc.endpoint) { const endpoint = node('div', 'endpoint-label'); endpoint.append(node('b', '', doc.method), document.createTextNode(doc.endpoint)); article.append(endpoint); }
    article.append(meta); $('tableOfContents').replaceChildren();
    doc.sections.forEach(section => {
      const group = node('section', 'doc-section'); group.id = `${doc.id}--${section.id}`;
      const h2 = node('h2'); highlight(h2, section.title, query); const anchor = linkTo(doc.id, section.id, '#'); anchor.className = 'heading-anchor'; anchor.setAttribute('aria-label', `Link to ${section.title}`); h2.append(anchor); group.append(h2);
      section.paragraphs.forEach(paragraph => { const p = node('p'); highlight(p, paragraph, query); group.append(p); });
      if (section.table) { const wrap = node('div', 'doc-table-wrap'), table = node('table', 'doc-table'), thead = node('thead'), tr = node('tr'); section.table[0].forEach(cell => { const th = node('th'); th.scope = 'col'; highlight(th, cell, query); tr.append(th); }); thead.append(tr); const tbody = node('tbody'); section.table.slice(1).forEach(row => { const r = node('tr'); row.forEach(cell => { const td = node('td'); highlight(td, cell, query); r.append(td); }); tbody.append(r); }); table.append(thead, tbody); wrap.append(table); group.append(wrap); }
      if (section.code) { const pre = node('pre', 'inline-code'), code = node('code'); highlight(code, section.code, query); pre.append(code); group.append(pre); }
      if (section.callout) { const callout = node('div', 'callout'), copy = node('div'); const title = node('strong'); highlight(title, section.callout[0], query); const body = node('p'); highlight(body, section.callout[1], query); copy.append(title, body); callout.append(node('span', '', 'ⓘ'), copy); group.append(callout); }
      if (section.links) { const links = node('div', 'doc-links'); section.links.forEach(([id, title, caption]) => { const button = node('button', 'doc-link'); button.type = 'button'; button.append(node('strong', '', title), node('small', '', caption), node('span', '', '↗')); button.addEventListener('click', () => showDoc(id, null, '', true)); links.append(button); }); group.append(links); }
      article.append(group); $('tableOfContents').append(linkTo(doc.id, section.id, section.title));
    });
  }
  function showDoc(id, section = null, query = '', focus = false) {
    if (!docs.some(doc => doc.id === id)) return;
    current = id; renderNavigation(); renderArticle(query); renderCode(); savePreferences();
    try { history.replaceState(null, '', `#${id}${section ? `--${section}` : ''}`); } catch (_) { /* Sandboxed origins may restrict URL changes. */ }
    const target = section ? $(`${id}--${section}`) : $('documentHeading');
    if (focus) { const heading = section ? target?.querySelector('h2') : target; if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); } target?.scrollIntoView({ behavior: smooth(), block: 'start' }); }
    closeSearch();
  }
  function requestSample() {
    const isProjects = current === 'projects', isRetrieve = current === 'retrieve', method = isProjects || isRetrieve ? 'GET' : 'POST';
    const path = isProjects ? '/v1/projects' : isRetrieve ? '/v1/messages/msg_001' : '/v1/messages';
    const url = `https://api.parcel.example${path}`, body = { project_id: 'prj_studio', recipient: 'hello@example.com', body: 'Your weekly brief is ready.' };
    if (language === 'js') return `// Placeholder domain; use the local\n// playground to run this example.\n\nconst response = await fetch(\n  "${url}",\n  {\n    method: "${method}",\n    headers: {\n      Authorization: "Bearer sk_demo_local",\n      "Content-Type": "application/json"\n    }${method === 'POST' ? `,\n    body: JSON.stringify({\n      project_id: "${body.project_id}",\n      recipient: "${body.recipient}",\n      body: "${body.body}"\n    })` : ''}\n  }\n);\n\nconst data = await response.json();\nif (!response.ok) {\n  throw new Error(data.error.message);\n}\nconsole.log(data);`;
    if (language === 'python') return `# Placeholder domain. Run requests\n# in this page's local playground.\nimport json\nfrom urllib.request import Request, urlopen\nfrom urllib.error import HTTPError\n\n${method === 'POST' ? `payload = json.dumps({\n    "project_id": "${body.project_id}",\n    "recipient": "${body.recipient}",\n    "body": "${body.body}"\n}).encode("utf-8")\n\n` : ''}request = Request(\n    "${url}",\n    ${method === 'POST' ? 'data=payload,\n    ' : ''}method="${method}",\n    headers={\n        "Authorization": "Bearer sk_demo_local",\n        "Content-Type": "application/json"\n    }\n)\n\ntry:\n    with urlopen(request) as response:\n        print(json.load(response))\nexcept HTTPError as error:\n    print(error.code, json.load(error))`;
    return `# Placeholder domain; use the\n# local playground to send a request.\n\ncurl --request ${method} \\\n  '${url}' \\\n  --header 'Authorization: Bearer sk_demo_local' \\\n  --header 'Content-Type: application/json'${method === 'POST' ? ` \\\n  --data '{\n    "project_id": "${body.project_id}",\n    "recipient": "${body.recipient}",\n    "body": "${body.body}"\n  }'` : ''}`;
  }
  function renderCode() { $('codeContent').textContent = requestSample(); $('codeFilename').textContent = { js: 'request.js', python: 'request.py', curl: 'request.sh' }[language]; document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language))); }
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => { language = button.dataset.language; renderCode(); savePreferences(); }));
  async function copy(content, message) {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(content);
      else { const active = document.activeElement, input = node('textarea'); input.value = content; input.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.append(input); input.select(); const done = document.execCommand('copy'); input.remove(); active?.focus({ preventScroll: true }); if (!done) throw new Error('Clipboard unavailable'); }
      toast(message);
    } catch (_) { toast('Clipboard is unavailable in this browser. Select the code and copy it manually.'); }
  }
  $('copyCode').addEventListener('click', () => copy($('codeContent').textContent, 'Example code copied. A good starting point.'));
  $('copyResponse').addEventListener('click', () => { if (responseObject) copy(JSON.stringify(responseObject, null, 2), 'Response JSON copied.'); });
  function closeSearch() { $('searchResults').hidden = true; $('searchInput').setAttribute('aria-expanded', 'false'); }
  function search() {
    searchQuery = $('searchInput').value.trim().slice(0, 100); const panel = $('searchResults'); panel.replaceChildren();
    if (!searchQuery) { closeSearch(); return; }
    panel.hidden = false; $('searchInput').setAttribute('aria-expanded', 'true'); const matches = [];
    for (const doc of docs) {
      const titleMatch = `${doc.title} ${doc.lead}`.toLowerCase().includes(searchQuery.toLowerCase());
      const section = doc.sections.find(item => [item.title, ...item.paragraphs, ...(item.table?.flat() || []), ...(item.callout || []), item.code || ''].join(' ').toLowerCase().includes(searchQuery.toLowerCase()));
      if (titleMatch || section) matches.push({ doc, section: section || doc.sections[0], titleMatch });
    }
    panel.append(node('div', 'search-summary', `${matches.length} ${matches.length === 1 ? 'DOCUMENT' : 'DOCUMENTS'} FOUND`));
    matches.forEach(({ doc, section, titleMatch }) => { const button = node('button', 'search-result'); button.type = 'button'; const title = node('strong'); highlight(title, doc.title, searchQuery); const caption = node('small'); highlight(caption, titleMatch ? doc.lead.slice(0, 100) : section.title, searchQuery); button.append(title, caption); button.addEventListener('click', () => showDoc(doc.id, titleMatch ? null : section.id, searchQuery, true)); panel.append(button); });
    if (!matches.length) { const empty = node('div', 'search-empty'); empty.append(node('strong', '', 'No results. Still room to explore.'), node('p', '', `Nothing matches “${searchQuery}”. Try “token”, “message”, or “400”.`)); const clear = node('button', '', 'Clear search'); clear.type = 'button'; clear.addEventListener('click', () => { $('searchInput').value = ''; closeSearch(); $('searchInput').focus(); }); empty.append(clear); panel.append(empty); }
  }
  $('searchInput').addEventListener('input', search); $('searchInput').addEventListener('focus', () => { if ($('searchInput').value.trim()) search(); });
  $('searchInput').addEventListener('keydown', event => { if (event.key === 'Escape') { closeSearch(); return; } if (event.key === 'ArrowDown' || event.key === 'Enter') { const first = $('searchResults').querySelector('.search-result'); if (first && !$('searchResults').hidden) { event.preventDefault(); event.key === 'Enter' ? first.click() : first.focus(); } } });
  $('searchResults').addEventListener('keydown', event => { const buttons = [...$('searchResults').querySelectorAll('button')], index = buttons.indexOf(document.activeElement); if (event.key === 'Escape') { closeSearch(); $('searchInput').focus(); } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); const next = index + (event.key === 'ArrowDown' ? 1 : -1); if (next < 0) $('searchInput').focus(); else buttons[Math.min(next, buttons.length - 1)]?.focus(); } });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.search-container')) closeSearch(); });
  window.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); closeMenu(); $('searchInput').focus(); $('searchInput').select(); } });
  $('menuButton').addEventListener('click', () => $('navDialog').showModal());
  function closeMenu() { if ($('navDialog').open) $('navDialog').close(); }
  $('closeMenu').addEventListener('click', closeMenu); $('navDialog').addEventListener('close', () => { if (document.activeElement === document.body) $('menuButton').focus({ preventScroll: true }); });
  function openPlayground() { $('playground').scrollIntoView({ behavior: smooth(), block: 'start' }); $('playgroundHeading').focus({ preventScroll: true }); }
  $('jumpPlayground').addEventListener('click', openPlayground);
  function updateEndpoint() { const type = $('endpointInput').value; $('createFields').hidden = type !== 'create'; $('retrieveFields').hidden = type !== 'retrieve'; }
  $('endpointInput').addEventListener('change', updateEndpoint);
  function defaultInputs() { $('endpointInput').value = 'create'; $('tokenInput').value = 'sk_demo_local'; $('projectInput').value = 'prj_studio'; $('recipientInput').value = 'hello@example.com'; $('messageInput').value = 'Your weekly brief is ready.'; $('messageIdInput').value = 'msg_001'; updateEndpoint(); }
  document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => { defaultInputs(); const type = button.dataset.scenario; if (type === 'bad-body') $('messageInput').value = ''; if (type === 'bad-token') $('tokenInput').value = 'sk_not_a_valid_token'; if (type === 'missing') { $('endpointInput').value = 'retrieve'; $('messageIdInput').value = 'msg_missing'; updateEndpoint(); } toast('Preset ready. Send the request to inspect its response.'); }));
  function setBusy(busy) { $('runRequest').disabled = busy; $('resetRequest').disabled = busy; $('requestFields').disabled = busy; $('cancelRequest').hidden = !busy; $('responsePanel').setAttribute('aria-busy', String(busy)); }
  function showResponse(status, payload, elapsed) {
    responseObject = payload; $('responseCode').textContent = JSON.stringify(payload, null, 2); $('copyResponse').disabled = false; $('responseStatus').textContent = `${status} ${({ 200: 'OK', 201: 'CREATED', 400: 'BAD REQUEST', 401: 'UNAUTHORIZED', 404: 'NOT FOUND' })[status]}`;
    const success = status < 400; $('responseStatus').className = success ? 'status-success' : 'status-error'; $('responseLight').className = `response-light ${success ? 'success' : 'error'}`; $('responseTime').textContent = `${Math.round(elapsed)} ms`; $('responseDescription').textContent = success ? 'Simulation complete. No network request was made.' : 'Check the error, adjust the request, and try again.';
  }
  function simulate(input) {
    const error = (status, code, message, field) => [status, { error: { code, message, ...(field ? { field } : {}) } }];
    if (input.token !== 'sk_demo_local') return error(401, 'invalid_token', 'Use the public demo token sk_demo_local.');
    if (input.endpoint === 'projects') return [200, { object: 'list', data: [{ id: 'prj_studio', name: 'Independent Studio' }] }];
    if (input.endpoint === 'retrieve') return messages.has(input.id) ? [200, { ...messages.get(input.id) }] : error(404, 'message_not_found', 'No message with this ID exists in the current page session.');
    if (input.project !== 'prj_studio') return error(404, 'project_not_found', 'Use the demo project prj_studio.', 'project_id');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.recipient)) return error(400, 'validation_error', 'Use an email-shaped recipient, such as hello@example.com.', 'recipient');
    if (!input.body || input.body.length > 280) return error(400, 'validation_error', 'Add a message body between 1 and 280 characters.', 'body');
    const message = { id: `msg_${String(++messageCounter).padStart(3, '0')}`, project_id: input.project, recipient: input.recipient, body: input.body, status: 'queued' }; messages.set(message.id, message); return [201, message];
  }
  $('requestForm').addEventListener('submit', event => {
    event.preventDefault(); if (activeRequest) return;
    const input = { endpoint: $('endpointInput').value, token: $('tokenInput').value.trim(), project: $('projectInput').value.trim(), recipient: $('recipientInput').value.trim(), body: $('messageInput').value.trim(), id: $('messageIdInput').value.trim() };
    const start = performance.now(); setBusy(true); responseObject = null; $('copyResponse').disabled = true; $('responseStatus').className = ''; $('responseStatus').textContent = 'SIMULATING…'; $('responseLight').className = 'response-light loading'; $('responseTime').textContent = '… ms'; $('responseDescription').textContent = 'Running locally. You can cancel before it completes.'; $('responseCode').textContent = '// Validating your local request…';
    const request = { timer: null }; activeRequest = request;
    request.timer = setTimeout(() => { if (activeRequest !== request) return; activeRequest = null; const [status, payload] = simulate(input); showResponse(status, payload, performance.now() - start); setBusy(false); }, 900);
  });
  $('cancelRequest').addEventListener('click', () => {
    if (!activeRequest) return; clearTimeout(activeRequest.timer); activeRequest = null; setBusy(false); responseObject = null; $('copyResponse').disabled = true; $('responseStatus').className = ''; $('responseStatus').textContent = 'CANCELLED'; $('responseLight').className = 'response-light'; $('responseCode').textContent = '// Request cancelled.\n// No message was created.\n// Edit your inputs and try again.'; $('responseTime').textContent = '— ms'; $('responseDescription').textContent = 'Cancelled locally. Nothing was sent or created.'; $('runRequest').focus({ preventScroll: true });
  });
  $('resetRequest').addEventListener('click', () => { defaultInputs(); responseObject = null; $('copyResponse').disabled = true; $('responseStatus').textContent = 'READY'; $('responseStatus').className = ''; $('responseLight').className = 'response-light'; $('responseTime').textContent = '— ms'; $('responseCode').textContent = '// A small request starts something good.\n// Send one to see its response here.'; $('responseDescription').textContent = 'Inputs reset. Created messages remain until this page reloads.'; toast('A fresh request, ready when you are.'); });
  window.addEventListener('resize', () => { if (innerWidth > 760) closeMenu(); });
  function fromHash() {
    const [id, section] = location.hash.slice(1).split('--');
    if (docs.some(doc => doc.id === id)) {
      showDoc(id, section || null, '', false);
      if (section) requestAnimationFrame(() => $(`${id}--${section}`)?.scrollIntoView({ block: 'start' }));
    } else showDoc(current);
  }
  window.addEventListener('hashchange', fromHash); fromHash(); updateEndpoint();
})();
