(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const ROOMS = Object.freeze({
    garden: { name: 'Garden room', rate: 185, capacity: 2, inventory: 2 },
    terrace: { name: 'Terrace suite', rate: 260, capacity: 2, inventory: 1 },
    ocean: { name: 'Ocean loft', rate: 345, capacity: 4, inventory: 1 }
  });
  const DRAFT_KEY = 'ui-atlas-stay-draft-v1';
  const BOOKINGS_KEY = 'ui-atlas-stay-bookings-v1';
  const DAY = 86400000;
  const TAX = 2.5;
  const bookingDialog = $('#booking-dialog');
  const actionDialog = $('#action-dialog');
  let step = 1;
  let openingElement = null;
  let toastTimer;
  let storageAvailable = true;
  let actionCallback = null;
  let isConfirming = false;

  function localDate(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function addDays(date, count) {
    const parsed = new Date(`${date}T12:00:00`);
    parsed.setDate(parsed.getDate() + count);
    return localDate(parsed);
  }
  function isDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00`);
    return Number.isFinite(date.getTime()) && localDate(date) === value;
  }
  function nights(arrival, departure) {
    return Math.round((Date.parse(`${departure}T00:00:00Z`) - Date.parse(`${arrival}T00:00:00Z`)) / DAY);
  }
  function money(value) {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
  }
  function dateLabel(value) {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
  }
  function dateRange(arrival, departure) {
    return `${dateLabel(arrival)} — ${dateLabel(departure)}`;
  }
  function showToast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
  }
  function storageWarning() {
    storageAvailable = false;
    $('#storage-note').textContent = 'Browser storage is unavailable. Your demo stays and draft will last only while this page is open.';
    $('#storage-note').hidden = false;
  }
  function readStorage(key, fallback) {
    let raw;
    try {
      raw = localStorage.getItem(key);
    } catch {
      storageWarning();
      return fallback;
    }
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch {
      // Malformed old data is recoverable; storage itself may still work.
      removeStorage(key);
      showToast('An unreadable local demo record was reset. You can start fresh.');
      return fallback;
    }
  }
  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      storageWarning();
      return false;
    }
  }
  function removeStorage(key) {
    try { localStorage.removeItem(key); } catch { storageWarning(); }
  }
  function normalizeDraft(value) {
    const fallbackArrival = addDays(localDate(), 1);
    const input = value && typeof value === 'object' ? value : {};
    return {
      room: Object.hasOwn(ROOMS, input.room) ? input.room : 'garden',
      arrival: isDate(input.arrival) ? input.arrival : fallbackArrival,
      departure: isDate(input.departure) ? input.departure : addDays(fallbackArrival, 3),
      guests: [1, 2, 3, 4].includes(Number(input.guests)) ? Number(input.guests) : 2,
      name: typeof input.name === 'string' ? input.name.slice(0, 80) : '',
      email: typeof input.email === 'string' ? input.email.slice(0, 150) : '',
      note: typeof input.note === 'string' ? input.note.slice(0, 350) : '',
      step: [1, 2, 3].includes(input.step) ? input.step : 1
    };
  }
  function validBooking(value) {
    return value && typeof value === 'object' && Object.hasOwn(ROOMS, value.room)
      && typeof value.id === 'string' && /^ST-[A-Z0-9-]{5,30}$/.test(value.id)
      && isDate(value.arrival) && isDate(value.departure) && nights(value.arrival, value.departure) >= 1
      && nights(value.arrival, value.departure) <= 14 && Number.isInteger(value.guests)
      && value.guests >= 1 && value.guests <= ROOMS[value.room].capacity
      && typeof value.name === 'string' && value.name.length <= 80
      && typeof value.email === 'string' && value.email.length <= 150
      && ['confirmed', 'cancelled'].includes(value.status);
  }
  const storedBookings = readStorage(BOOKINGS_KEY, []);
  let bookings = Array.isArray(storedBookings) ? storedBookings.filter(validBooking).slice(0, 100) : [];
  const savedDraft = readStorage(DRAFT_KEY, null);
  let hasDraft = !!(savedDraft && typeof savedDraft === 'object');
  let draft = normalizeDraft(savedDraft);

  function formDraft() {
    return {
      room: $('input[name="room"]:checked')?.value || draft.room,
      arrival: $('#arrival').value,
      departure: $('#departure').value,
      guests: Number($('#guests').value),
      name: $('#guest-name').value.trim(),
      email: $('#guest-email').value.trim(),
      note: $('#guest-note').value.trim(),
      step: Math.min(step, 3)
    };
  }
  function persistDraft() {
    if (step === 4) return;
    draft = formDraft();
    hasDraft = true;
    writeStorage(DRAFT_KEY, draft);
    $('#draft-note').hidden = false;
  }
  function syncInputs() {
    $(`input[name="room"][value="${draft.room}"]`).checked = true;
    $('#arrival').value = draft.arrival;
    $('#departure').value = draft.departure;
    $('#guests').value = String(draft.guests);
    $('#guest-name').value = draft.name;
    $('#guest-email').value = draft.email;
    $('#guest-note').value = draft.note;
    $('#quick-arrival').value = draft.arrival;
    $('#quick-departure').value = draft.departure;
    $('#quick-guests').value = String(draft.guests);
    updateDateBounds();
    updateEstimate();
  }
  function updateDateBounds() {
    const today = localDate();
    for (const prefix of ['', 'quick-']) {
      const arrival = $(`#${prefix}arrival`);
      const departure = $(`#${prefix}departure`);
      arrival.min = today;
      arrival.max = addDays(today, 730);
      departure.min = isDate(arrival.value) && arrival.value >= today ? addDays(arrival.value, 1) : addDays(today, 1);
      departure.max = isDate(arrival.value) ? addDays(arrival.value, 14) : addDays(today, 744);
    }
  }
  function changeArrival(arrival, departure) {
    if (isDate(arrival.value) && (!isDate(departure.value) || departure.value <= arrival.value || nights(arrival.value, departure.value) > 14)) {
      departure.value = addDays(arrival.value, 3);
    }
    updateDateBounds();
  }
  function price(stay) {
    const count = nights(stay.arrival, stay.departure);
    const roomTotal = ROOMS[stay.room].rate * count;
    const tax = TAX * stay.guests * count;
    return { count, roomTotal, tax, total: roomTotal + tax };
  }
  function updateEstimate() {
    const stay = formDraft();
    const count = nights(stay.arrival, stay.departure);
    const room = ROOMS[stay.room];
    if (!Number.isFinite(count) || count < 1 || count > 14) {
      $('#estimate-description').textContent = 'Choose dates for your total';
      $('#estimate-total').textContent = '—';
    } else {
      $('#estimate-description').textContent = `${count} ${count === 1 ? 'night' : 'nights'} · ${stay.guests} ${stay.guests === 1 ? 'guest' : 'guests'} · city tax included`;
      $('#estimate-total').textContent = money(price(stay).total);
    }
    $('#guests').setCustomValidity(stay.guests > room.capacity ? `${room.name} accommodates up to ${room.capacity} guests. Choose Ocean loft for 3–4 guests.` : '');
  }
  function hasAvailability(stay) {
    const overlapping = bookings.filter(booking => booking.status === 'confirmed' && booking.room === stay.room && booking.arrival < stay.departure && booking.departure > stay.arrival);
    // Check each night individually: back-to-back bookings do not consume two rooms.
    for (let date = stay.arrival; date < stay.departure; date = addDays(date, 1)) {
      if (overlapping.filter(booking => booking.arrival <= date && booking.departure > date).length >= ROOMS[stay.room].inventory) return false;
    }
    return true;
  }
  function validateStay(stay) {
    if (!Object.hasOwn(ROOMS, stay.room)) return 'Please choose a room.';
    if (!isDate(stay.arrival) || !isDate(stay.departure)) return 'Choose both your arrival and departure dates.';
    if (stay.arrival < localDate()) return 'Your arrival must be today or later. Please choose new dates.';
    if (stay.arrival > addDays(localDate(), 730)) return 'Choose an arrival within the next two years.';
    const count = nights(stay.arrival, stay.departure);
    if (count < 1 || count > 14) return 'Choose a stay of 1–14 nights, with departure after arrival.';
    if (!Number.isInteger(stay.guests) || stay.guests < 1 || stay.guests > ROOMS[stay.room].capacity) return `${ROOMS[stay.room].name} accommodates up to ${ROOMS[stay.room].capacity} guests. Choose Ocean loft for 3–4 guests.`;
    if (!hasAvailability(stay)) return 'This room is full for at least one of these nights in the demo inventory. Try another room or different dates.';
    return '';
  }
  function setError(id, message) {
    $(id).textContent = message;
    $(id).hidden = !message;
  }
  function goToStep(next, focus = true) {
    step = next;
    $$('.booking-step').forEach((panel, index) => { panel.hidden = index + 1 !== next; });
    $$('.step-indicator li').forEach((label, index) => {
      if (index + 1 === next) label.setAttribute('aria-current', 'step');
      else label.removeAttribute('aria-current');
      label.classList.toggle('is-complete', index + 1 < next);
    });
    $('.step-indicator').hidden = next === 4;
    if (next === 3) renderReview();
    if (next < 4) persistDraft();
    bookingDialog.setAttribute('aria-labelledby', next === 1 ? 'booking-title' : `step-${next}-title`);
    const heading = $(`#step-${next} h2`);
    if (next !== 1) heading.id = `step-${next}-title`;
    if (focus) {
      bookingDialog.scrollTop = 0;
      heading.focus({ preventScroll: true });
    }
  }
  function openBooking(options = {}) {
    openingElement = document.activeElement;
    if (options.room) draft.room = options.room;
    if (options.arrival) draft.arrival = options.arrival;
    if (options.departure) draft.departure = options.departure;
    if (options.guests) draft.guests = options.guests;
    if (options.guests > 2) draft.room = 'ocean';
    syncInputs();
    $('#demo-consent').checked = false;
    setError('#stay-error', '');
    setError('#review-error', '');
    // A restored draft may be incomplete or stale; do not skip its required fields.
    let next = options.resume ? draft.step : 1;
    if (next > 1 && validateStay(formDraft())) next = 1;
    if (next === 3 && (!$('#details-form').checkValidity() || draft.name.trim().length < 2)) next = 2;
    bookingDialog.showModal();
    goToStep(next);
  }
  function closeBooking() {
    if (step < 4) persistDraft();
    bookingDialog.close();
    if (openingElement?.isConnected) openingElement.focus({ preventScroll: true });
  }
  function el(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function detailLine(parent, text) { parent.append(el('p', '', text)); }
  function editButton(text, destination) {
    const button = el('button', 'edit-button', text);
    button.type = 'button';
    button.addEventListener('click', () => goToStep(destination));
    return button;
  }
  function renderReview() {
    const stay = formDraft();
    const room = ROOMS[stay.room];
    const costs = price(stay);
    const wrapper = $('#review-details');
    wrapper.replaceChildren();
    const roomCard = el('div', 'review-card');
    roomCard.append(editButton('Edit stay', 1), el('h3', '', room.name));
    detailLine(roomCard, dateRange(stay.arrival, stay.departure));
    detailLine(roomCard, `${costs.count} ${costs.count === 1 ? 'night' : 'nights'} · ${stay.guests} ${stay.guests === 1 ? 'guest' : 'guests'} · breakfast included`);
    const guestCard = el('div', 'review-card');
    guestCard.append(editButton('Edit details', 2));
    detailLine(guestCard, stay.name);
    detailLine(guestCard, stay.email);
    if (stay.note) detailLine(guestCard, `Your note: ${stay.note}`);
    const breakdown = el('div', 'cost-breakdown');
    [[`${money(room.rate)} × ${costs.count} ${costs.count === 1 ? 'night' : 'nights'}`, money(costs.roomTotal)], [`City tax · ${money(TAX)} / guest / night`, money(costs.tax)], ['Breakfast & all service fees', 'Included'], ['Total · no payment taken', money(costs.total)]].forEach(([label, value], index) => {
      const row = el('div', index === 3 ? 'total' : '');
      row.append(el('span', '', label), el(index === 3 ? 'strong' : 'span', '', value));
      breakdown.append(row);
    });
    wrapper.append(roomCard, guestCard, breakdown);
  }
  function renderBookings() {
    const list = $('#reservations-list');
    list.replaceChildren();
    $('#booking-count').textContent = String(bookings.filter(booking => booking.status === 'confirmed').length);
    if (!bookings.length) {
      const empty = el('div', 'empty-stays');
      const copy = el('div');
      copy.append(el('h3', '', 'Good days are still ahead.'), el('p', '', 'Your demo stays will appear here. Shall we find you a room?'));
      const button = el('button', 'underlined-link', 'Find your quiet corner ↗');
      button.type = 'button';
      button.addEventListener('click', () => openBooking());
      empty.append(copy, button);
      list.append(empty);
      return;
    }
    [...bookings].reverse().forEach(booking => {
      const card = el('article', `booking-card${booking.status === 'cancelled' ? ' cancelled' : ''}`);
      const heading = el('div');
      heading.append(el('span', 'booking-ref', booking.id), el('h3', '', ROOMS[booking.room].name), el('p', '', booking.name));
      const info = el('div');
      info.append(el('p', '', dateRange(booking.arrival, booking.departure)), el('p', '', `${nights(booking.arrival, booking.departure)} nights · ${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}`), el('span', 'booking-status', booking.status === 'cancelled' ? 'CANCELLED · DEMO' : 'SAVED · DEMO'));
      const cost = el('div', 'booking-price', money(price(booking).total));
      cost.append(el('small', '', 'Total · no payment taken'));
      card.append(heading, info, cost);
      if (booking.status === 'confirmed') {
        const cancel = el('button', 'text-button', 'Cancel demo stay');
        cancel.type = 'button';
        cancel.setAttribute('aria-label', `Cancel ${ROOMS[booking.room].name}, ${dateLabel(booking.arrival)}, ${booking.id}`);
        cancel.addEventListener('click', () => confirmAction({
          title: 'Let this stay go?',
          description: `Cancel ${ROOMS[booking.room].name}, ${dateRange(booking.arrival, booking.departure)}? This releases its demo room.`,
          confirm: 'Cancel demo stay',
          keep: 'Keep my stay',
          callback: () => {
            bookings = bookings.map(item => item.id === booking.id ? { ...item, status: 'cancelled' } : item);
            writeStorage(BOOKINGS_KEY, bookings);
            renderBookings();
            $('#reservations-heading').focus({ preventScroll: true });
            showToast('Your demo stay has been cancelled. The room is available again.');
          }
        }));
        card.append(cancel);
      }
      list.append(card);
    });
  }
  function confirmAction({ title, description, confirm, keep, callback }) {
    $('#action-title').textContent = title;
    $('#action-description').textContent = description;
    $('#action-confirm').textContent = confirm;
    $('button[value="keep"]', actionDialog).textContent = keep;
    actionCallback = callback;
    actionDialog.returnValue = '';
    actionDialog.showModal();
    $('button[value="keep"]', actionDialog).focus();
  }
  actionDialog.addEventListener('close', () => {
    const callback = actionCallback;
    actionCallback = null;
    if (actionDialog.returnValue === 'confirm') callback?.();
  });
  $('#stay-form').addEventListener('submit', event => {
    event.preventDefault();
    updateEstimate();
    const error = validateStay(formDraft());
    setError('#stay-error', error);
    if (error) return;
    goToStep(2);
  });
  $('#details-form').addEventListener('submit', event => {
    event.preventDefault();
    const nameInput = $('#guest-name');
    nameInput.setCustomValidity(nameInput.value.trim().length < 2 ? 'Please enter your full name (at least 2 characters).' : '');
    if (!event.currentTarget.reportValidity()) return;
    persistDraft();
    goToStep(3);
  });
  $('#guest-name').addEventListener('input', () => $('#guest-name').setCustomValidity(''));
  $('#stay-form').addEventListener('input', () => {
    updateDateBounds();
    updateEstimate();
    setError('#stay-error', '');
    persistDraft();
  });
  $('#arrival').addEventListener('change', () => {
    changeArrival($('#arrival'), $('#departure'));
    updateEstimate();
    persistDraft();
  });
  $('#details-form').addEventListener('input', persistDraft);
  $('#quick-arrival').addEventListener('change', () => changeArrival($('#quick-arrival'), $('#quick-departure')));
  $('#quick-form').addEventListener('submit', event => {
    event.preventDefault();
    openBooking({ arrival: $('#quick-arrival').value, departure: $('#quick-departure').value, guests: Number($('#quick-guests').value) });
  });
  $$('[data-book]').forEach(button => button.addEventListener('click', () => openBooking()));
  $$('[data-room]').forEach(button => button.addEventListener('click', () => openBooking({ room: button.dataset.room })));
  $$('[data-back]').forEach(button => button.addEventListener('click', () => goToStep(Number(button.dataset.back))));
  $('#close-booking').addEventListener('click', closeBooking);
  bookingDialog.addEventListener('cancel', event => { event.preventDefault(); closeBooking(); });
  $('#resume-draft').addEventListener('click', () => openBooking({ resume: true }));
  $('#reset-draft').addEventListener('click', () => confirmAction({
    title: 'Start with a clean slate?',
    description: 'This clears the unfinished reservation and its contact details. Your saved demo stays will remain.',
    confirm: 'Reset draft', keep: 'Keep my draft',
    callback: () => {
      removeStorage(DRAFT_KEY);
      draft = normalizeDraft(null);
      hasDraft = false;
      step = 1;
      syncInputs();
      $('#draft-note').hidden = true;
      showToast('Draft cleared. A fresh start awaits.');
      $('#reservations-heading').focus({ preventScroll: true });
    }
  }));
  $('#open-reservations').addEventListener('click', () => {
    $('#my-stays').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('#reservations-heading').focus({ preventScroll: true });
  });
  $('#view-stays').addEventListener('click', () => {
    closeBooking();
    $('#my-stays').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('#reservations-heading').focus({ preventScroll: true });
  });
  $('#confirm-booking').addEventListener('click', () => {
    if (isConfirming || step !== 3) return;
    const stay = formDraft();
    const error = validateStay(stay);
    if (error) {
      goToStep(1);
      setError('#stay-error', error);
      return;
    }
    if (!$('#details-form').checkValidity() || stay.name.length < 2) {
      goToStep(2);
      $('#details-form').reportValidity();
      return;
    }
    if (!$('#demo-consent').checked) {
      setError('#review-error', 'Please confirm that you understand this is a local demo reservation.');
      $('#demo-consent').focus();
      return;
    }
    if (bookings.length >= 100) {
      setError('#review-error', 'This browser has reached the limit of 100 demo stays. Please use a fresh browser profile to try another.');
      return;
    }
    isConfirming = true;
    const id = `ST-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const booking = { ...stay, id, status: 'confirmed', createdAt: new Date().toISOString() };
    bookings.push(booking);
    writeStorage(BOOKINGS_KEY, bookings);
    removeStorage(DRAFT_KEY);
    hasDraft = false;
    $('#draft-note').hidden = true;
    renderBookings();
    const details = el('div', 'confirmation-details');
    details.append(el('strong', '', ROOMS[booking.room].name), el('p', '', dateRange(booking.arrival, booking.departure)), el('p', '', `${nights(booking.arrival, booking.departure)} nights · ${booking.guests} guests · ${money(price(booking).total)} total`), el('p', 'confirmation-ref', booking.id));
    $('#confirmation-details').replaceChildren(details);
    $('.confirmation>p:not(.eyebrow)').textContent = storageAvailable ? 'Your demo stay is saved on this device.' : 'Your demo stay is saved for this page session.';
    goToStep(4);
    draft = normalizeDraft(null);
    isConfirming = false;
  });
  $('#demo-consent').addEventListener('change', () => setError('#review-error', ''));
  // Reconcile inventory from another tab before it can create a conflicting stay.
  window.addEventListener('storage', event => {
    if (event.key !== BOOKINGS_KEY && event.key !== null) return;
    const latest = readStorage(BOOKINGS_KEY, []);
    bookings = Array.isArray(latest) ? latest.filter(validBooking).slice(0, 100) : [];
    renderBookings();
    if (bookingDialog.open && step < 4) showToast('Demo availability updated from another tab. We will recheck before confirming.');
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateDateBounds(); });
  syncInputs();
  renderBookings();
  $('#draft-note').hidden = !hasDraft;
})();
