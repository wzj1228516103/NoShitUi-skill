const LANGUAGES = ['zh-CN', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];
const STORAGE_KEY = 'noshitui-language';
const LOCALE_VERSION = '20261016-1';
const REPOSITORY = 'https://github.com/wzj1228516103/NoShitUi-skill';
const cards = [...document.querySelectorAll('#project-grid .card')];
const directory = [...document.querySelectorAll('.project-index a')];
const search = document.getElementById('project-search');
const filters = [...document.querySelectorAll('[data-filter]')];
const summary = document.getElementById('result-summary');
const emptyState = document.getElementById('empty-state');
const picker = document.getElementById('language-select');
const languageControl = document.querySelector('.language-control');
const languageStatus = document.getElementById('language-status');
const total = document.getElementById('project-total');
const bundles = new Map();
const pending = new Map();
const original = new Map(cards.map(card => [card.dataset.project, {
  name: card.querySelector('h2').firstChild.textContent.trim(),
  italic: !!card.querySelector('h2 i'),
  search: `${card.textContent} ${card.dataset.search}`,
}]));
let activeLocale = 'en';
let activeUi = {
  allCount: '{total} examples', filteredCount: '{visible} of {total} examples',
  loadError: 'This language could not load. Please try again.',
};
let category = 'all';
let generation = 0;
let searchable = new Map();

const normalize = text => text.normalize('NFKC').toLocaleLowerCase().trim();
const text = (selector, value) => { document.querySelector(selector).textContent = value; };
const attribute = (selector, name, value) => { document.querySelector(selector).setAttribute(name, value); };
const format = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key]);
const br = () => document.createElement('br');

function resolveLocale(value) {
  if (typeof value !== 'string') return null;
  const code = value.toLowerCase();
  if (code === 'zh' || code.startsWith('zh-')) return 'zh-CN';
  const base = code.split('-')[0];
  return LANGUAGES.includes(base) ? base : null;
}

function preferredLocale() {
  const explicit = resolveLocale(new URL(location.href).searchParams.get('lang'));
  if (explicit) return explicit;
  try {
    const saved = resolveLocale(localStorage.getItem(STORAGE_KEY));
    if (saved) return saved;
  } catch { /* The page also works when storage is unavailable. */ }
  return (navigator.languages || [navigator.language]).map(resolveLocale).find(Boolean) || 'en';
}

function refreshSearchIndex() {
  searchable = new Map(cards.map(card => {
    const id = card.dataset.project;
    const translations = [...bundles.values()].map(bundle => {
      const project = bundle.projects[id];
      return [project.name, project.role, project.slogan, project.description, ...project.tags, project.action].join(' ');
    });
    return [card, normalize([original.get(id).search, ...translations].join(' '))];
  }));
}

function render() {
  const terms = normalize(search.value).split(/\s+/).filter(Boolean);
  let visible = 0;
  cards.forEach(card => {
    const matchesCategory = category === 'all'
      || (category === '3d' ? card.dataset['3d'] === 'true' : card.dataset.category === category);
    card.hidden = !(matchesCategory && terms.every(term => searchable.get(card).includes(term)));
    if (!card.hidden) visible++;
  });
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  summary.textContent = format(category === 'all' && terms.length === 0 ? activeUi.allCount : activeUi.filteredCount,
    { total: cards.length, visible });
  emptyState.hidden = visible !== 0;
}

function applyBundle(bundle) {
  const ui = bundle.ui;
  const navigation = document.querySelectorAll('.top-links>a');
  const repoNav = navigation[0];
  repoNav.replaceChildren(repoNav.querySelector('img'), document.createTextNode(ui.repoNav + ' '));
  const arrow = document.createElement('span');
  arrow.textContent = '↗';
  arrow.setAttribute('aria-hidden', 'true');
  repoNav.append(arrow);
  navigation[1].textContent = ui.navAbout;
  navigation[2].textContent = ui.navExamples;
  navigation[3].textContent = ui.navInstall;
  const readme = `${REPOSITORY}/blob/master/${bundle.readme}`;
  navigation[3].href = `${readme}#${encodeURIComponent(bundle.installAnchor)}`;
  document.querySelector('.repo-cta').href = readme;

  const strong = document.createElement('strong');
  strong.textContent = ui.repoStrong;
  document.querySelector('.repo-copy p').replaceChildren(document.createTextNode(ui.repoIntro + ' '), strong);
  const emphasis = document.createElement('em');
  emphasis.textContent = ui.heroLine2;
  document.querySelector('.hero h1').replaceChildren(document.createTextNode(ui.heroLine1), br(), emphasis);
  total.textContent = cards.length;
  document.querySelector('.hero-aside strong').replaceChildren(document.createTextNode(ui.oneSkill), br(), total,
    document.createTextNode(ui.examplesSuffix));
  document.querySelector('.hero-aside>div').replaceChildren(document.createTextNode(ui.workflow), br(),
    document.createTextNode(ui.workflowDetail1), br(), document.createTextNode(ui.workflowDetail2));

  for (const [selector, key] of [
    ['#language-label', 'languageLabel'], ['.repo-cta>span', 'repoCta'], ['.repo-cta small', 'repoCtaSmall'],
    ['.eyebrow', 'eyebrow'], ['.hero p', 'heroDescription'], ['.hero-jump', 'heroJump'],
    ['.search-field label', 'searchLabel'], ['#collection-title', 'collectionTitle'],
    ['#empty-state h3', 'emptyTitle'], ['#empty-state p', 'emptyText'], ['#clear-filters', 'clearFilters'],
    ['.notes h3', 'notesTitle'], ['.notes>div>p:nth-of-type(1)', 'notesText1'],
    ['.notes>div>p:nth-of-type(2)', 'notesText2'], ['footer>span', 'footer'],
  ]) text(selector, ui[key]);
  for (const [selector, name, key] of [
    ['.top>.brand', 'aria-label', 'brandAria'], ['.top-links', 'aria-label', 'navAria'],
    ['.repo-nav', 'aria-label', 'repoAria'], ['.repo-note', 'aria-label', 'repoNoteAria'],
    ['.repo-cta', 'aria-label', 'repoCtaAria'], ['#language-select', 'aria-label', 'languageLabel'],
    ['#project-search', 'placeholder', 'searchPlaceholder'], ['#catalog-tools', 'aria-label', 'findAria'],
    ['.filters', 'aria-label', 'filtersAria'], ['.project-index', 'aria-label', 'directoryAria'],
  ]) attribute(selector, name, ui[key]);
  const filterKeys = { all: 'filterAll', '3d': 'filter3d', product: 'filterProduct', creative: 'filterCreative', brand: 'filterBrand', motion: 'filterMotion' };
  filters.forEach(button => {
    const count = button.querySelector('[data-filter-count]');
    button.replaceChildren(document.createTextNode(ui[filterKeys[button.dataset.filter]]), count);
  });

  cards.forEach((card, index) => {
    const data = bundle.projects[card.dataset.project];
    const source = original.get(card.dataset.project);
    const name = data.name || source.name;
    const slogan = document.createElement(source.italic ? 'i' : 'span');
    slogan.className = 'card-slogan';
    slogan.textContent = data.slogan;
    card.querySelector('h2').replaceChildren(document.createTextNode(name), br(), slogan);
    card.querySelector('.card-num').textContent = `${String(index + 1).padStart(2, '0')} / ${data.role}`;
    card.querySelector('p').textContent = data.description;
    card.querySelectorAll('.card-tags span').forEach((tag, i) => { tag.textContent = data.tags[i]; });
    card.querySelector('.card-cta').textContent = data.action;
    card.querySelector('.card-preview img').alt = `${name} — ${data.role}`;
    const badge = card.querySelector('.preview-badge');
    if (badge) badge.textContent = card.dataset['3d'] === 'true' ? ui.badge3d : ui.badgeNew;
    const link = directory[index];
    const number = link.querySelector('span');
    const subtitle = link.querySelector('small');
    subtitle.textContent = data.role;
    link.replaceChildren(number, document.createTextNode(name), subtitle);
  });
  activeUi = ui;
  activeLocale = bundle.language;
  document.documentElement.lang = activeLocale;
  document.title = ui.pageTitle;
  document.querySelector('meta[name="description"]').content = ui.pageDescription;
  picker.value = activeLocale;
  refreshSearchIndex();
  render();
  document.documentElement.dataset.locale = activeLocale;
}

function loadBundle(locale) {
  if (bundles.has(locale)) return Promise.resolve(bundles.get(locale));
  if (pending.has(locale)) return pending.get(locale);
  const request = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const url = new URL(`./locales/${locale}.json`, import.meta.url);
      url.searchParams.set('v', LOCALE_VERSION);
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('Language request failed');
      const bundle = await response.json();
      if (bundle.language !== locale || !bundle.ui || cards.some(card => !bundle.projects?.[card.dataset.project])) {
        throw new Error('Incomplete language bundle');
      }
      bundles.set(locale, bundle);
      return bundle;
    } finally {
      clearTimeout(timeout);
      pending.delete(locale);
    }
  })();
  pending.set(locale, request);
  return request;
}

async function changeLanguage(locale, { persist = false, initial = false } = {}) {
  const token = ++generation;
  languageStatus.hidden = true;
  languageControl.setAttribute('aria-busy', 'true');
  try {
    const bundle = await loadBundle(locale);
    if (token !== generation) return;
    applyBundle(bundle);
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* Optional preference storage. */ }
      const url = new URL(location.href);
      url.searchParams.set('lang', locale);
      history.replaceState(history.state, '', url);
    }
  } catch {
    if (token !== generation) return;
    if (initial && locale !== 'en') return changeLanguage('en', { initial: true });
    picker.value = activeLocale;
    languageStatus.textContent = activeUi.loadError;
    languageStatus.hidden = false;
  } finally {
    if (token === generation) languageControl.removeAttribute('aria-busy');
  }
}

total.textContent = cards.length;
filters.forEach(button => {
  button.querySelector('[data-filter-count]').textContent = cards.filter(card => button.dataset.filter === 'all'
    || (button.dataset.filter === '3d' ? card.dataset['3d'] === 'true' : card.dataset.category === button.dataset.filter)).length;
  button.addEventListener('click', () => { category = button.dataset.filter; render(); });
});
search.addEventListener('input', render);
document.getElementById('clear-filters').addEventListener('click', () => {
  category = 'all';
  search.value = '';
  render();
  search.focus();
});
picker.addEventListener('change', () => changeLanguage(picker.value, { persist: true }));
refreshSearchIndex();
render();
document.getElementById('catalog-tools').hidden = false;
languageControl.hidden = false;
const initialLocale = preferredLocale();
picker.value = initialLocale;
changeLanguage(initialLocale, { initial: true });
