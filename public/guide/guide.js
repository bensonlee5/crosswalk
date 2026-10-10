// Progressive enhancement: every instruction and profile is readable without JS.
document.documentElement.classList.add('has-js');
const search = document.querySelector('#character-search');
const region = document.querySelector('#character-region');
const people = [...document.querySelectorAll('.person')];
const count = document.querySelector('#cast-count');
const empty = document.querySelector('#no-results');
const groups = [...document.querySelectorAll('.cast-region')];
function filterPeople() {
  const query = search.value.trim().toLocaleLowerCase();
  let visible = 0;
  for (const person of people) {
    const matches = (!region.value || person.dataset.region === region.value) &&
      (!query || person.textContent.toLocaleLowerCase().includes(query));
    person.hidden = !matches;
    if (matches) visible++;
  }
  for (const group of groups) {
    const members = [...group.querySelectorAll('.person')];
    const matches = members.filter(person => !person.hidden).length;
    group.hidden = matches === 0;
    group.querySelector('.region-count').textContent = `${matches} of ${members.length} ${members.length === 1 ? 'person' : 'people'}`;
  }
  count.textContent = `${visible} of ${people.length} people${query || region.value ? ' match your search' : ' · Open a backstory to read their beginnings'}`;
  empty.hidden = visible !== 0;
}
search.addEventListener('input', filterPeople);
region.addEventListener('change', filterPeople);
filterPeople();
const reset = document.querySelector('#reset-cast');
reset?.addEventListener('click', () => {
  search.value = '';
  region.value = '';
  filterPeople();
  search.focus();
});
// Region jumps reveal their destination even if another search was active.
for (const link of document.querySelectorAll('[data-cast-region]')) {
  link.addEventListener('click', () => {
    search.value = '';
    region.value = link.dataset.castRegion;
    filterPeople();
  });
}
// Print every backstory, then restore the reader's disclosure state.
let printState = [];
if (typeof window !== 'undefined') {
  window.addEventListener('beforeprint', () => {
    if (printState.length) return;
    printState = [...document.querySelectorAll('.backstory')].map(details => ({
      details, open: details.open, name: details.getAttribute('name'),
    }));
    // Disable exclusive grouping before opening, otherwise only one can print.
    for (const {details} of printState) details.removeAttribute('name');
    for (const {details} of printState) details.open = true;
  });
  window.addEventListener('afterprint', () => {
    for (const {details, open, name} of printState) {
      details.open = open;
      if (name !== null) details.setAttribute('name', name);
    }
    printState = [];
  });
}
// Keep each name and biography readable if a portrait fails to load.
for (const portrait of document.querySelectorAll('.portrait img')) {
  portrait.addEventListener('error', () => { portrait.hidden = true; });
  if (portrait.complete && portrait.naturalWidth === 0) portrait.hidden = true;
}
