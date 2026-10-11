/* Local progressive enhancement: all catalog entries have ordinary static links. */
(() => {
  'use strict';
  const form = document.querySelector('[data-catalog-search]');
  if (!form) return;
  const query = document.getElementById('catalog-query');
  const region = document.getElementById('catalog-region');
  const type = document.getElementById('catalog-type');
  const entryStatus = document.getElementById('catalog-status');
  const brand = document.getElementById('catalog-brand');
  const owner = document.getElementById('catalog-owner');
  const reset = document.getElementById('catalog-reset');
  const count = document.getElementById('catalog-count');
  const empty = document.getElementById('catalog-empty');
  const cards = [...document.querySelectorAll('[data-catalog-card]')];
  const fold = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’‘]/g, "'");
  const controls = [['region', region], ['type', type], ['status', entryStatus], ['brand', brand], ['owner', owner]].filter(([, control]) => control);
  const index = cards.map(card => ({card, search: fold(card.dataset.search), regions: card.dataset.region.split(' '), brands:(card.dataset.brand ?? '').split(' '), owners:(card.dataset.owner ?? '').split(' ')}));
  const apply = (updateURL = true) => {
    const tokens = fold(query.value.trim()).split(/\s+/).filter(Boolean);
    let total = 0;
    for (const {card, search, regions, brands, owners} of index) {
      const matches = (!region.value || regions.includes(region.value)) && (!type.value || card.dataset.type === type.value) && (!entryStatus?.value || card.dataset.status === entryStatus.value) && (!brand?.value || brands.includes(brand.value)) && (!owner?.value || owners.includes(owner.value)) && tokens.every(token => search.includes(token));
      card.hidden = !matches;
      if (matches) total++;
    }
    const regionLabel = region.value ? region.options[region.selectedIndex].text : 'all regions';
    const otherLabels = controls.filter(([name, control]) => name !== 'region' && control.value).map(([, control]) => control.options[control.selectedIndex].text);
    count.textContent = `${total} of ${cards.length} ${form.dataset.catalogSearch} · ${[regionLabel, ...otherLabels].join(' · ')}${query.value.trim() ? ` · “${query.value.trim()}”` : ''}`;
    empty.hidden = total !== 0;
    reset.disabled = !query.value && controls.every(([, control]) => !control.value);
    if (updateURL) {
      const url = new URL(window.location.href);
      if (query.value.trim()) url.searchParams.set('q', query.value.trim()); else url.searchParams.delete('q');
      for (const [name, control] of controls) {
        if (control.value) url.searchParams.set(name, control.value); else url.searchParams.delete(name);
      }
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  };
  const restore = () => {
    const params = new URLSearchParams(window.location.search);
    query.value = params.get('q') || '';
    for (const [name, control] of controls) control.value = [...control.options].some(option => option.value === params.get(name)) ? params.get(name) : '';
    apply(false);
  };
  query.addEventListener('input', () => apply());
  for (const [, control] of controls) control.addEventListener('change', () => apply());
  form.addEventListener('submit', event => { event.preventDefault(); apply(); });
  reset.addEventListener('click', () => {
    query.value = '';
    for (const [, control] of controls) control.value = '';
    apply();
    query.focus();
  });
  window.addEventListener('pageshow', restore);
  window.addEventListener('popstate', restore);
  restore();
})();
