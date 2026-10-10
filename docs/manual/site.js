/* Progressive enhancement only: every person and place has an ordinary static URL. */
(() => {
  'use strict';
  const form = document.querySelector('[data-character-search]');
  if (!form) return;
  const search = document.getElementById('character-search');
  const select = document.getElementById('character-region');
  const reset = document.getElementById('reset-search');
  const status = document.getElementById('search-status');
  const empty = document.getElementById('no-results');
  const cards = [...document.querySelectorAll('[data-person-card]')];
  const groups = [...document.querySelectorAll('[data-cast-region]')];
  const fold = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’‘]/g, "'");
  const apply = (updateURL = true) => {
    const tokens = fold(search.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      const matches = (!select.value || card.dataset.region === select.value) && tokens.every(token => fold(card.dataset.search).includes(token));
      card.hidden = !matches;
      if (matches) count++;
    });
    groups.forEach(group => { group.hidden = ![...group.querySelectorAll('[data-person-card]')].some(card => !card.hidden); });
    const regionLabel = select.value ? select.options[select.selectedIndex].text : 'all regions';
    status.textContent = `${count} of ${cards.length} characters · ${regionLabel}${search.value.trim() ? ` · “${search.value.trim()}”` : ''}`;
    empty.hidden = count !== 0;
    reset.disabled = !search.value && !select.value;
    if (updateURL) {
      const url = new URL(window.location.href);
      if (search.value.trim()) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
      if (select.value) url.searchParams.set('region', select.value); else url.searchParams.delete('region');
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  };
  const restore = () => {
    const params = new URLSearchParams(window.location.search);
    search.value = params.get('q') || '';
    select.value = [...select.options].some(option => option.value === params.get('region')) ? params.get('region') : '';
    apply(false);
  };
  search.addEventListener('input', () => apply());
  select.addEventListener('change', () => apply());
  form.addEventListener('submit', event => { event.preventDefault(); apply(); });
  reset.addEventListener('click', () => { search.value = ''; select.value = ''; apply(); search.focus(); });
  document.querySelectorAll('[data-jump-region]').forEach(link => link.addEventListener('click', () => {
    search.value = ''; select.value = ''; apply();
  }));
  window.addEventListener('pageshow', restore);
  window.addEventListener('popstate', restore);
  restore();
})();
