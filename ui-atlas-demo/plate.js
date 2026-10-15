(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const STORAGE_KEY = 'ui-atlas-plate-v1';
  const MAX_QUANTITY = 20;
  const MAX_LINES = 30;
  const MAX_ORDERS = 50;
  const CATEGORIES = [
    { id: 'starters', name: 'To start', subtitle: 'The first good idea.' },
    { id: 'pasta', name: 'From the pan', subtitle: 'A little twist of happiness.' },
    { id: 'salads', name: 'Green things', subtitle: 'Fresh from the good earth.' },
    { id: 'desserts', name: 'Something sweet', subtitle: 'There’s always a little room.' }
  ];
  const SIZES = {
    starters: [{ id: 'regular', name: 'Just right', price: 0 }, { id: 'sharing', name: 'For the table', price: 400 }],
    pasta: [{ id: 'regular', name: 'Perfectly hungry', price: 0 }, { id: 'large', name: 'A little more', price: 500 }],
    salads: [{ id: 'regular', name: 'A good bowl', price: 0 }, { id: 'large', name: 'A bigger bowl', price: 400 }],
    desserts: [{ id: 'regular', name: 'All yours', price: 0 }, { id: 'sharing', name: 'A little to share', price: 500 }]
  };
  const EXTRAS = {
    basil: { name: 'Fresh basil', price: 100 },
    parmesan: { name: 'A little parmesan', price: 200 },
    burrata: { name: 'Creamy burrata', price: 400 },
    prawns: { name: 'Extra prawns', price: 500 },
    sourdough: { name: 'Warm sourdough', price: 200 },
    avocado: { name: 'Sliced avocado', price: 300 },
    olives: { name: 'A handful of olives', price: 150 },
    gelato: { name: 'Vanilla gelato', price: 250 },
    espresso: { name: 'An extra espresso shot', price: 150 }
  };
  const MENU = [
    { id: 'burrata', name: 'Burrata & tomatoes', category: 'starters', price: 1200, description: 'Soft burrata, the sweetest tomatoes, basil oil, and a very good olive oil.', diets: ['vegetarian', 'gf'], extras: ['sourdough', 'basil'], image: 'salad', position: '25% 45%', popular: true },
    { id: 'bruschetta', name: 'Tomato bruschetta', category: 'starters', price: 800, description: 'Grilled sourdough, ripe tomatoes, a little garlic, and torn fresh basil.', diets: ['vegetarian', 'vegan'], extras: ['basil', 'olives'], image: 'salad', position: '75% 65%' },
    { id: 'olives', name: 'Olives, the good ones', category: 'starters', price: 600, description: 'Warm marinated olives, orange peel, rosemary, and a pinch of sea salt.', diets: ['vegetarian', 'vegan', 'gf'], extras: ['sourdough', 'olives'], image: 'salad', position: '50% 80%' },
    { id: 'pomodoro', name: 'Rigatoni pomodoro', category: 'pasta', price: 1600, description: 'Slow-cooked tomato sauce, fresh basil, and parmesan. Simple, for a reason.', diets: ['vegetarian'], extras: ['basil', 'parmesan', 'burrata'], image: 'pasta', position: '50% 50%', popular: true },
    { id: 'prawns', name: 'Lemon prawn linguine', category: 'pasta', price: 2200, description: 'Juicy prawns, lemon zest, garlic, parsley, and just enough chilli.', diets: [], extras: ['prawns', 'basil', 'parmesan'], image: 'pasta', position: '25% 30%' },
    { id: 'mushroom', name: 'Wild mushroom pasta', category: 'pasta', price: 1900, description: 'Roasted mushrooms, wide ribbons of pasta, thyme butter, and pecorino.', diets: ['vegetarian'], extras: ['basil', 'parmesan', 'burrata'], image: 'pasta', position: '80% 70%' },
    { id: 'garden', name: 'The garden bowl', category: 'salads', price: 1300, description: 'Seasonal leaves, cucumber, white beans, toasted seeds, and lemon dressing.', diets: ['vegetarian', 'vegan', 'gf'], extras: ['avocado', 'olives', 'basil'], image: 'salad', position: '50% 50%' },
    { id: 'peach', name: 'Peach & burrata', category: 'salads', price: 1700, description: 'Roasted peaches, creamy burrata, peppery rocket, and a sweet balsamic finish.', diets: ['vegetarian', 'gf'], extras: ['avocado', 'burrata', 'olives'], image: 'salad', position: '65% 30%', popular: true },
    { id: 'chocolate', name: 'Chocolate, amore', category: 'desserts', price: 800, description: 'Rich chocolate cake, a little cocoa, and the kind of forkful you remember.', diets: ['vegetarian'], extras: ['gelato', 'espresso'], image: 'dessert', position: '50% 45%', popular: true },
    { id: 'dolce', name: 'Dolce to share', category: 'desserts', price: 1100, description: 'A generous chocolate slice for two. Slow down, swap stories, take another bite.', diets: ['vegetarian'], extras: ['gelato', 'espresso'], image: 'dessert', position: '60% 65%' }
  ];
  const DISHES = Object.fromEntries(MENU.map(dish => [dish.id, dish]));
  const DIET_NAMES = { vegetarian: 'VEGETARIAN', vegan: 'VEGAN', gf: 'GLUTEN FREE' };
  const dishDialog = $('#dish-dialog');
  const bagDialog = $('#bag-dialog');
  const actionDialog = $('#action-dialog');
  let category = 'all';
  let search = '';
  const activeDiets = new Set();
  let dishDraft = null;
  let editingId = null;
  let dishReturnTarget = null;
  let bagReturnTarget = null;
  let bagStep = 1;
  let toastTimer;
  let actionCallback = null;
  let storageAvailable = true;
  let confirming = false;

  function money(cents) {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
  }
  function el(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function button(text, className, callback) {
    const node = el('button', className, text);
    node.type = 'button';
    node.addEventListener('click', callback);
    return node;
  }
  function showToast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4200);
  }
  function setError(id, message) {
    $(id).textContent = message;
    $(id).hidden = !message;
  }
  function storageWarning() {
    storageAvailable = false;
    $('#storage-note').textContent = 'Browser storage is unavailable. Your bag and demo orders will last only while this page is open.';
    $('#storage-note').hidden = false;
  }
  function defaultFulfilment() {
    return { method: 'collection', name: '', table: '', timing: 'asap', slot: '', note: '' };
  }
  function normalizeFulfilment(value) {
    const source = value && typeof value === 'object' ? value : {};
    return {
      method: source.method === 'dinein' ? 'dinein' : 'collection',
      name: typeof source.name === 'string' ? source.name.slice(0, 50) : '',
      table: typeof source.table === 'string' ? source.table.slice(0, 5) : '',
      timing: source.timing === 'scheduled' ? 'scheduled' : 'asap',
      slot: typeof source.slot === 'string' ? source.slot.slice(0, 16) : '',
      note: typeof source.note === 'string' ? source.note.slice(0, 240) : ''
    };
  }
  function normalizeItem(value) {
    if (!value || typeof value !== 'object' || !Object.hasOwn(DISHES, value.dishId)) return null;
    const dish = DISHES[value.dishId];
    if (typeof value.id !== 'string' || value.id.length > 80 || !value.id) return null;
    if (!SIZES[dish.category].some(size => size.id === value.sizeId)) return null;
    if (!Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > MAX_QUANTITY) return null;
    const extraIds = Array.isArray(value.extraIds) ? [...new Set(value.extraIds.filter(id => dish.extras.includes(id)))].sort() : [];
    return { id: value.id, dishId: dish.id, sizeId: value.sizeId, quantity: value.quantity, extraIds, note: typeof value.note === 'string' ? value.note.slice(0, 240) : '' };
  }
  function normalizeItems(value) {
    if (!Array.isArray(value)) return [];
    const result = [];
    const ids = new Set();
    for (const item of value.slice(0, MAX_LINES)) {
      const normalized = normalizeItem(item);
      if (normalized && !ids.has(normalized.id)) {
        result.push(normalized);
        ids.add(normalized.id);
      }
    }
    return result;
  }
  function normalizeOrder(value) {
    if (!value || typeof value !== 'object' || typeof value.id !== 'string' || !/^PL-[A-Z0-9-]{5,35}$/.test(value.id)) return null;
    if (!['saved', 'cancelled'].includes(value.status) || typeof value.createdAt !== 'string' || value.createdAt.length > 40 || !Number.isFinite(Date.parse(value.createdAt))) return null;
    const items = normalizeItems(value.items);
    if (!items.length) return null;
    return { id: value.id, createdAt: value.createdAt, status: value.status, items, fulfilment: normalizeFulfilment(value.fulfilment) };
  }
  function readState() {
    const fallback = { items: [], fulfilment: defaultFulfilment(), orders: [] };
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch { storageWarning(); return fallback; }
    if (!raw) return fallback;
    let parsed;
    try { parsed = JSON.parse(raw); } catch {
      showToast('An unreadable local demo record was reset. A fresh menu awaits.');
      try { localStorage.removeItem(STORAGE_KEY); } catch { storageWarning(); }
      return fallback;
    }
    if (!parsed || typeof parsed !== 'object') return fallback;
    return { items: normalizeItems(parsed.items), fulfilment: normalizeFulfilment(parsed.fulfilment), orders: Array.isArray(parsed.orders) ? parsed.orders.slice(0, MAX_ORDERS).map(normalizeOrder).filter(Boolean) : [] };
  }
  let state = readState();
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageAvailable = true;
      $('#storage-note').hidden = true;
      return true;
    } catch { storageWarning(); return false; }
  }
  function itemUnitPrice(item) {
    const dish = DISHES[item.dishId];
    const size = SIZES[dish.category].find(option => option.id === item.sizeId);
    return dish.price + size.price + item.extraIds.reduce((total, id) => total + EXTRAS[id].price, 0);
  }
  function total(items = state.items) { return items.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0); }
  function count(items = state.items) { return items.reduce((sum, item) => sum + item.quantity, 0); }
  function itemDescription(item) {
    const dish = DISHES[item.dishId];
    const size = SIZES[dish.category].find(option => option.id === item.sizeId).name;
    const additions = item.extraIds.map(id => EXTRAS[id].name);
    return [size, ...additions].join(' · ');
  }
  function updateBagButtons() {
    $$('[data-bag-count]').forEach(node => { node.textContent = String(count()); });
    $$('[data-bag-total]').forEach(node => { node.textContent = money(total()); });
    $$('[data-open-bag]').forEach(node => node.setAttribute('aria-label', `Open shopping bag, ${count()} dishes, ${money(total())}`));
  }
  function renderDietTags(container, dish) {
    container.replaceChildren();
    // Vegan dishes already imply vegetarian; avoid repeating both badges.
    dish.diets.filter(diet => !(diet === 'vegetarian' && dish.diets.includes('vegan'))).forEach(diet => container.append(el('span', '', DIET_NAMES[diet])));
    if (dish.popular) container.append(el('span', 'popular-tag', 'A HOUSE FAVORITE'));
  }
  function renderMenu() {
    const query = search.trim().toLowerCase();
    const visible = MENU.filter(dish => (category === 'all' || dish.category === category)
      && [...activeDiets].every(diet => dish.diets.includes(diet))
      && `${dish.name} ${dish.description} ${CATEGORIES.find(group => group.id === dish.category).name}`.toLowerCase().includes(query));
    $('#menu-result').textContent = `${visible.length} ${visible.length === 1 ? 'good thing' : 'good things'} to choose from.${activeDiets.size ? ' Dietary labels describe the base dish.' : ''}`;
    $('#empty-menu').hidden = visible.length > 0;
    const groups = $('#menu-groups');
    groups.replaceChildren();
    CATEGORIES.forEach(group => {
      const dishes = visible.filter(dish => dish.category === group.id);
      if (!dishes.length) return;
      const section = el('section', 'menu-group');
      section.setAttribute('aria-labelledby', `category-${group.id}`);
      const heading = el('div', 'group-heading');
      const title = el('h3', '', group.name);
      title.id = `category-${group.id}`;
      heading.append(title, el('span', '', group.subtitle));
      const grid = el('div', 'dish-grid');
      dishes.forEach(dish => {
        const card = el('article', 'dish-card');
        const open = button('', 'dish-open', () => openDish(dish.id));
        open.setAttribute('aria-label', `Choose ${dish.name}, from ${money(dish.price)}`);
        const imageWrap = el('span', 'dish-photo');
        const image = el('img');
        image.src = `assets/plate/${dish.image}.webp`;
        image.alt = '';
        image.loading = 'lazy';
        image.width = 650;
        image.height = 434;
        image.style.objectPosition = dish.position;
        const add = el('span', 'dish-add-icon', '+');
        add.setAttribute('aria-hidden', 'true');
        imageWrap.append(image, add);
        const info = el('span', 'dish-card-info');
        const row = el('span', 'dish-title-row');
        row.append(el('h4', '', dish.name), el('strong', '', money(dish.price)));
        info.append(row, el('span', 'dish-card-description', dish.description));
        const tags = el('span', 'dish-tags');
        renderDietTags(tags, dish);
        info.append(tags);
        open.append(imageWrap, info);
        card.append(open);
        grid.append(card);
      });
      section.append(heading, grid);
      groups.append(section);
    });
  }
  function readDishConfiguration() {
    dishDraft.sizeId = $('input[name="dish-size"]:checked', dishDialog).value;
    dishDraft.extraIds = $$('input[name="dish-extra"]:checked', dishDialog).map(input => input.value).sort();
    dishDraft.note = $('#dish-note').value.trim();
  }
  function updateDishTotal() {
    readDishConfiguration();
    $('#dish-quantity').value = String(dishDraft.quantity);
    $('#dish-quantity').textContent = String(dishDraft.quantity);
    $('#dish-minus').disabled = dishDraft.quantity <= 1;
    $('#dish-plus').disabled = dishDraft.quantity >= MAX_QUANTITY;
    $('#dish-total').textContent = money(itemUnitPrice(dishDraft) * dishDraft.quantity);
  }
  function openDish(dishId, itemId = null) {
    const dish = DISHES[dishId];
    if (!dish) return;
    const existing = itemId ? state.items.find(item => item.id === itemId) : null;
    dishReturnTarget = document.activeElement;
    editingId = existing?.id || null;
    dishDraft = existing ? { ...existing, extraIds: [...existing.extraIds] } : { id: '', dishId, sizeId: 'regular', extraIds: [], note: '', quantity: 1 };
    $('#dish-category').textContent = CATEGORIES.find(group => group.id === dish.category).name.toUpperCase();
    $('#dish-title').textContent = dish.name;
    $('#dish-description').textContent = dish.description;
    $('#dish-photo').style.backgroundImage = `url('assets/plate/${dish.image}.webp')`;
    $('#dish-photo').style.backgroundPosition = dish.position;
    renderDietTags($('#dish-tags'), dish);
    $('#dish-sizes').replaceChildren();
    SIZES[dish.category].forEach(size => {
      const label = el('label');
      const input = el('input');
      input.type = 'radio';
      input.name = 'dish-size';
      input.value = size.id;
      input.checked = dishDraft.sizeId === size.id;
      label.append(input, el('span', '', size.name), el('small', '', money(dish.price + size.price)));
      $('#dish-sizes').append(label);
    });
    $('#dish-extras').replaceChildren();
    dish.extras.forEach(id => {
      const label = el('label');
      const input = el('input');
      input.type = 'checkbox';
      input.name = 'dish-extra';
      input.value = id;
      input.checked = dishDraft.extraIds.includes(id);
      label.append(input, el('span', '', EXTRAS[id].name), el('small', '', `+${money(EXTRAS[id].price)}`));
      $('#dish-extras').append(label);
    });
    $('#dish-note').value = dishDraft.note;
    $('#dish-add-label').textContent = editingId ? 'Save my changes' : 'Add to my bag';
    setError('#dish-error', '');
    updateDishTotal();
    dishDialog.showModal();
    dishDialog.scrollTop = 0;
    $('#dish-title').focus({ preventScroll: true });
  }
  function closeDish(saved = false) {
    dishDialog.close();
    if (saved && bagDialog.open) $('#bag-title').focus({ preventScroll: true });
    else if (dishReturnTarget?.isConnected) dishReturnTarget.focus({ preventScroll: true });
    else if (bagDialog.open) $('#bag-title').focus({ preventScroll: true });
    dishDraft = null;
    editingId = null;
  }
  function signature(item) { return JSON.stringify([item.dishId, item.sizeId, [...item.extraIds].sort(), item.note]); }
  $('#dish-form').addEventListener('submit', event => {
    event.preventDefault();
    readDishConfiguration();
    const others = state.items.filter(item => item.id !== editingId);
    const match = others.find(item => signature(item) === signature(dishDraft));
    if (match && match.quantity + dishDraft.quantity > MAX_QUANTITY) {
      setError('#dish-error', `You already have ${match.quantity} of this exact plate. Each configuration can have up to ${MAX_QUANTITY}; try a smaller quantity.`);
      return;
    }
    if (!match && others.length >= MAX_LINES) {
      setError('#dish-error', `There’s room for ${MAX_LINES} different plates in one demo order. Remove one from your bag first.`);
      return;
    }
    if (match) match.quantity += dishDraft.quantity;
    else others.push({ ...dishDraft, extraIds: [...dishDraft.extraIds], id: editingId || `ITEM-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` });
    state.items = others;
    saveState();
    updateBagButtons();
    if (bagDialog.open) renderBag();
    const wasEditing = !!editingId;
    closeDish(true);
    showToast(wasEditing ? 'A little change. Looking good.' : 'Added to your bag. Good choice.');
  });
  $('#dish-form').addEventListener('input', () => { if (dishDraft) { updateDishTotal(); setError('#dish-error', ''); } });
  $('#dish-minus').addEventListener('click', () => { if (dishDraft.quantity > 1) { dishDraft.quantity--; updateDishTotal(); } });
  $('#dish-plus').addEventListener('click', () => { if (dishDraft.quantity < MAX_QUANTITY) { dishDraft.quantity++; updateDishTotal(); } });
  $('#close-dish').addEventListener('click', () => closeDish());
  dishDialog.addEventListener('cancel', event => { event.preventDefault(); closeDish(); });

  function readFulfilment() {
    return {
      method: $('input[name="method"]:checked', bagDialog)?.value || 'collection',
      name: $('#pickup-name').value.trim(),
      table: $('#table-number').value,
      timing: $('#order-timing').value,
      slot: $('#order-slot').value,
      note: $('#order-note').value.trim()
    };
  }
  function datetimeValue(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  function updateTimeBounds() {
    $('#order-slot').min = datetimeValue(new Date(Math.ceil(Date.now() / 60000) * 60000 + 20 * 60000));
    $('#order-slot').max = datetimeValue(new Date(Date.now() + 7 * 86400000));
  }
  function updateFulfilmentFields() {
    const collection = $('input[name="method"]:checked', bagDialog)?.value !== 'dinein';
    $('#pickup-name-field').hidden = !collection;
    $('#pickup-name').disabled = !collection;
    $('#pickup-name').required = collection;
    $('#table-number-field').hidden = collection;
    $('#table-number').disabled = collection;
    $('#table-number').required = !collection;
    const scheduled = $('#order-timing').value === 'scheduled';
    $('#order-slot-field').hidden = !scheduled;
    $('#order-slot').disabled = !scheduled;
    $('#order-slot').required = scheduled;
    updateTimeBounds();
  }
  function fillCheckout() {
    const fulfilment = state.fulfilment;
    $(`input[name="method"][value="${fulfilment.method}"]`, bagDialog).checked = true;
    $('#pickup-name').value = fulfilment.name;
    $('#pickup-name').setCustomValidity('');
    $('#table-number').value = fulfilment.table;
    $('#order-timing').value = fulfilment.timing;
    $('#order-slot').value = fulfilment.slot;
    $('#order-note').value = fulfilment.note;
    updateFulfilmentFields();
  }
  function changeQuantity(id, amount, target) {
    const item = state.items.find(candidate => candidate.id === id);
    if (!item) return;
    const next = item.quantity + amount;
    if (next < 1 || next > MAX_QUANTITY) return;
    item.quantity = next;
    saveState();
    renderBag();
    updateBagButtons();
    // The updated row replaces its controls; restore focus to the equivalent button.
    const row = $$('.bag-item').find(node => node.dataset.itemId === id);
    const control = row && $(target, row);
    if (control && !control.disabled) control.focus({ preventScroll: true });
    else if (row) $('.bag-item-title', row).focus({ preventScroll: true });
  }
  function renderBag() {
    const items = $('#bag-items');
    items.replaceChildren();
    const empty = !state.items.length;
    $('#empty-bag').hidden = !empty;
    $('#checkout-form').hidden = empty;
    $('#clear-bag').hidden = empty;
    $('#bag-item-summary').textContent = `${count()} ${count() === 1 ? 'plate' : 'plates'} of happiness`;
    $('#checkout-total').textContent = money(total());
    state.items.forEach(item => {
      const dish = DISHES[item.dishId];
      const row = el('article', 'bag-item');
      row.dataset.itemId = item.id;
      const image = el('img', 'bag-item-image');
      image.src = `assets/plate/${dish.image}.webp`;
      image.alt = '';
      image.style.objectPosition = dish.position;
      const info = el('div');
      const title = el('h3', 'bag-item-title', dish.name);
      title.tabIndex = -1;
      info.append(title, el('p', '', itemDescription(item)));
      if (item.note) info.append(el('p', '', `Your note: ${item.note}`));
      const actions = el('div', 'bag-item-actions');
      const quantity = el('div', 'quantity-control');
      const minus = button('−', 'bag-minus', () => changeQuantity(item.id, -1, '.bag-minus'));
      minus.setAttribute('aria-label', `Decrease ${dish.name} quantity`);
      minus.disabled = item.quantity <= 1;
      const plus = button('+', 'bag-plus', () => changeQuantity(item.id, 1, '.bag-plus'));
      plus.setAttribute('aria-label', `Increase ${dish.name} quantity`);
      plus.disabled = item.quantity >= MAX_QUANTITY;
      const output = el('output', '', String(item.quantity));
      output.setAttribute('aria-label', `${dish.name} quantity`);
      quantity.append(minus, output, plus);
      const edit = button('Make a change', 'text-button', () => openDish(dish.id, item.id));
      edit.setAttribute('aria-label', `Edit ${dish.name}`);
      actions.append(quantity, edit);
      info.append(actions);
      const cost = el('div', 'bag-item-price', money(itemUnitPrice(item) * item.quantity));
      const remove = button('Remove', 'bag-item-delete', () => {
        state.items = state.items.filter(candidate => candidate.id !== item.id);
        saveState();
        renderBag();
        updateBagButtons();
        $('#bag-title').focus({ preventScroll: true });
        showToast(`${dish.name} removed from your bag.`);
      });
      remove.setAttribute('aria-label', `Remove ${dish.name} from bag`);
      cost.append(remove);
      row.append(image, info, cost);
      items.append(row);
    });
  }
  function goBagStep(next) {
    bagStep = next;
    $$('.bag-step').forEach((panel, index) => { panel.hidden = index + 1 !== next; });
    const headingId = ['bag-title', 'review-title', 'confirmation-title'][next - 1];
    bagDialog.setAttribute('aria-labelledby', headingId);
    bagDialog.scrollTop = 0;
    $(`#${headingId}`).focus({ preventScroll: true });
  }
  function openBag() {
    bagReturnTarget = document.activeElement;
    fillCheckout();
    renderBag();
    setError('#checkout-error', '');
    setError('#review-error', '');
    $('#demo-consent').checked = false;
    bagDialog.showModal();
    goBagStep(1);
  }
  function closeBag() {
    if (bagStep < 3) {
      state.fulfilment = readFulfilment();
      saveState();
    }
    bagDialog.close();
    if (bagReturnTarget?.isConnected) bagReturnTarget.focus({ preventScroll: true });
  }
  function validateCheckout(fulfilment) {
    if (!state.items.length) return 'Your bag is empty. Find a plate you love first.';
    if (fulfilment.method === 'collection' && fulfilment.name.trim().length < 2) return 'Please enter a collection name with at least 2 characters.';
    const table = Number(fulfilment.table);
    if (fulfilment.method === 'dinein' && (!Number.isInteger(table) || table < 1 || table > 30)) return 'Please enter your table number, from 1 to 30.';
    if (fulfilment.timing === 'scheduled') {
      const time = new Date(fulfilment.slot).getTime();
      if (!Number.isFinite(time) || time < Date.now() + 20 * 60000 || time > Date.now() + 7 * 86400000) return 'Choose a preferred time between 20 minutes and 7 days from now.';
    }
    return '';
  }
  function timeLabel(fulfilment) {
    if (fulfilment.timing !== 'scheduled' || !Number.isFinite(new Date(fulfilment.slot).getTime())) return 'As soon as possible';
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(fulfilment.slot));
  }
  function fulfilmentLabel(fulfilment) {
    return fulfilment.method === 'dinein' ? `Dine in · Table ${fulfilment.table}` : `Collection · ${fulfilment.name}`;
  }
  function renderReview() {
    const review = $('#order-review');
    review.replaceChildren();
    const food = el('div', 'review-section');
    food.append(el('h3', '', 'The good things.'));
    state.items.forEach(item => {
      const row = el('div', 'review-line');
      const copy = el('span', '', `${item.quantity} × ${DISHES[item.dishId].name}`);
      copy.append(el('small', '', itemDescription(item)));
      if (item.note) copy.append(el('small', '', `Note: ${item.note}`));
      row.append(copy, el('strong', '', money(itemUnitPrice(item) * item.quantity)));
      food.append(row);
    });
    const where = el('div', 'review-section');
    where.append(el('h3', '', 'The little details.'), el('p', '', fulfilmentLabel(state.fulfilment)), el('p', '', timeLabel(state.fulfilment)));
    if (state.fulfilment.note) where.append(el('p', '', `Your note: ${state.fulfilment.note}`));
    const price = el('div', 'review-totals');
    price.append(el('span', '', 'Total · all fees included'), el('strong', '', money(total())));
    review.append(food, where, price);
  }
  $('#checkout-form').addEventListener('input', () => {
    $('#pickup-name').setCustomValidity('');
    updateFulfilmentFields();
    state.fulfilment = readFulfilment();
    saveState();
    setError('#checkout-error', '');
  });
  $('#checkout-form').addEventListener('submit', event => {
    event.preventDefault();
    const fulfilment = readFulfilment();
    const error = validateCheckout(fulfilment);
    setError('#checkout-error', error);
    if (error) {
      if (fulfilment.method === 'collection' && fulfilment.name.length < 2) {
        $('#pickup-name').setCustomValidity('Please enter at least 2 characters for the collection name.');
        $('#pickup-name').reportValidity();
      }
      return;
    }
    state.fulfilment = fulfilment;
    saveState();
    renderReview();
    goBagStep(2);
  });
  $('#confirm-order').addEventListener('click', () => {
    if (confirming || bagStep !== 2) return;
    const error = validateCheckout(state.fulfilment);
    if (error) {
      goBagStep(1);
      setError('#checkout-error', error);
      updateTimeBounds();
      return;
    }
    if (!$('#demo-consent').checked) {
      setError('#review-error', 'Please confirm that you understand this is a local demonstration order.');
      $('#demo-consent').focus();
      return;
    }
    if (state.orders.length >= MAX_ORDERS) {
      setError('#review-error', `This browser has reached its limit of ${MAX_ORDERS} demo orders. Please use a fresh browser profile to try another.`);
      return;
    }
    confirming = true;
    const id = `PL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const order = { id, createdAt: new Date().toISOString(), status: 'saved', items: state.items.map(item => ({ ...item, extraIds: [...item.extraIds] })), fulfilment: { ...state.fulfilment } };
    state.orders.push(order);
    state.items = [];
    state.fulfilment = defaultFulfilment();
    saveState();
    updateBagButtons();
    renderOrders();
    const card = el('div', 'confirmation-card');
    card.append(el('strong', '', order.id), el('h3', '', fulfilmentLabel(order.fulfilment)), el('p', '', timeLabel(order.fulfilment)), el('p', '', `${count(order.items)} ${count(order.items) === 1 ? 'plate' : 'plates'} · all your little extras included`), el('p', '', money(total(order.items))));
    $('#confirmation-details').replaceChildren(card);
    $('#confirmation-message').textContent = storageAvailable ? 'Your demo order is saved on this device.' : 'Your demo order is saved for this page session.';
    goBagStep(3);
    confirming = false;
  });
  $('#demo-consent').addEventListener('change', () => setError('#review-error', ''));
  $('#edit-order').addEventListener('click', () => { renderBag(); goBagStep(1); });
  $$('[data-open-bag]').forEach(node => node.addEventListener('click', openBag));
  $('#close-bag').addEventListener('click', closeBag);
  bagDialog.addEventListener('cancel', event => { event.preventDefault(); closeBag(); });
  $('#back-to-menu').addEventListener('click', () => {
    closeBag();
    $('#menu').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('#menu-search').focus({ preventScroll: true });
  });
  function confirmAction({ title, description, confirm, keep, callback }) {
    $('#action-title').textContent = title;
    $('#action-description').textContent = description;
    $('#action-confirm').textContent = confirm;
    $('#action-keep').textContent = keep;
    actionCallback = callback;
    actionDialog.returnValue = '';
    actionDialog.showModal();
    $('#action-keep').focus();
  }
  actionDialog.addEventListener('close', () => {
    const callback = actionCallback;
    actionCallback = null;
    if (actionDialog.returnValue === 'confirm') callback?.();
  });
  $('#clear-bag').addEventListener('click', () => confirmAction({
    title: 'Start with a fresh plate?',
    description: 'This removes the dishes in your bag and clears the unfinished checkout details. Your saved demo orders will stay.',
    confirm: 'Clear my bag', keep: 'Keep the good things',
    callback: () => {
      state.items = [];
      state.fulfilment = defaultFulfilment();
      saveState();
      fillCheckout();
      renderBag();
      updateBagButtons();
      $('#bag-title').focus({ preventScroll: true });
      showToast('A fresh start. There’s always something good on the menu.');
    }
  }));
  function renderOrders() {
    const list = $('#order-list');
    list.replaceChildren();
    if (!state.orders.length) {
      const empty = el('div', 'empty-orders');
      const copy = el('div');
      copy.append(el('h3', '', 'A good meal is a good beginning.'), el('p', '', 'Your demo orders, with every little extra, will be kept here.'));
      const link = el('a', 'text-button', 'Find your first favorite ↗');
      link.href = '#menu';
      empty.append(copy, link);
      list.append(empty);
      return;
    }
    [...state.orders].reverse().forEach(order => {
      const card = el('article', `order-card${order.status === 'cancelled' ? ' cancelled' : ''}`);
      const heading = el('div', 'order-card-heading');
      const identity = el('div');
      identity.append(el('span', 'order-card-ref', order.id), el('h3', '', fulfilmentLabel(order.fulfilment)));
      heading.append(identity, el('span', 'order-status', order.status === 'cancelled' ? 'CANCELLED · DEMO' : 'SAVED · DEMO'));
      const main = el('div', 'order-card-main');
      const lines = el('ul', 'order-lines');
      order.items.forEach(item => {
        const line = el('li', '', `${item.quantity} × ${DISHES[item.dishId].name}`);
        line.append(el('small', '', itemDescription(item)));
        if (item.note) line.append(el('small', '', `Note: ${item.note}`));
        lines.append(line);
      });
      const details = el('div');
      details.append(el('p', '', timeLabel(order.fulfilment)), el('p', '', `${count(order.items)} ${count(order.items) === 1 ? 'plate' : 'plates'} · all fees included`));
      if (order.fulfilment.note) details.append(el('p', '', order.fulfilment.note));
      const amount = el('div', 'order-price', money(total(order.items)));
      amount.append(el('small', '', 'No payment taken'));
      main.append(lines, details, amount);
      const footer = el('div', 'order-card-footer');
      footer.append(el('span', '', `Saved ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(order.createdAt))}`));
      if (order.status === 'saved') {
        const cancel = button('Cancel demo order', 'text-button', () => confirmAction({
          title: 'Let this order go?', description: `Cancel demo order ${order.id}? This only updates the saved record on this device.`, confirm: 'Cancel demo order', keep: 'Keep my order',
          callback: () => {
            state.orders = state.orders.map(candidate => candidate.id === order.id ? { ...candidate, status: 'cancelled' } : candidate);
            saveState();
            renderOrders();
            $('#orders-title').focus({ preventScroll: true });
            showToast('Your demo order has been cancelled.');
          }
        }));
        cancel.setAttribute('aria-label', `Cancel demo order ${order.id}`);
        footer.append(cancel);
      }
      card.append(heading, main, footer);
      list.append(card);
    });
  }
  $('#view-orders').addEventListener('click', () => {
    closeBag();
    $('#your-orders').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('#orders-title').focus({ preventScroll: true });
  });
  $('#menu-search').addEventListener('input', event => { search = event.currentTarget.value; renderMenu(); });
  $$('[data-category]').forEach(node => node.addEventListener('click', () => {
    category = node.dataset.category;
    $$('[data-category]').forEach(item => item.setAttribute('aria-pressed', String(item === node)));
    renderMenu();
  }));
  $$('[data-diet]').forEach(node => node.addEventListener('click', () => {
    const diet = node.dataset.diet;
    if (activeDiets.has(diet)) activeDiets.delete(diet);
    else activeDiets.add(diet);
    node.setAttribute('aria-pressed', String(activeDiets.has(diet)));
    renderMenu();
  }));
  $('#reset-filters').addEventListener('click', () => {
    category = 'all';
    search = '';
    activeDiets.clear();
    $('#menu-search').value = '';
    $$('[data-category]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.category === 'all')));
    $$('[data-diet]').forEach(node => node.setAttribute('aria-pressed', 'false'));
    renderMenu();
    $('#menu-search').focus({ preventScroll: true });
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateTimeBounds(); });
  renderMenu();
  renderOrders();
  fillCheckout();
  updateBagButtons();
})();
