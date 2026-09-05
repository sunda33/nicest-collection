import './style.css';

const products = [
  { id: 1, name: 'Ari Slingback', category: 'shoes', price: 58000, image: '/images/shoes.png', tag: 'New', position: 'center' },
  { id: 2, name: 'Mila Court Heel', category: 'shoes', price: 62000, image: '/images/shoes.png', tag: 'Bestseller', position: '60% center' },
  { id: 3, name: 'Sade Evening Heel', category: 'shoes', price: 54000, image: '/images/shoes.png', tag: '', position: '38% center' },
  { id: 4, name: 'Amara Top Handle', category: 'bags', price: 94000, image: '/images/bag.png', tag: 'New', position: 'center' },
  { id: 5, name: 'Nora City Bag', category: 'bags', price: 88000, image: '/images/bag.png', tag: '', position: '55% center' },
  { id: 6, name: 'Imani Day Tote', category: 'bags', price: 105000, image: '/images/bag.png', tag: 'Limited', position: '42% center' },
  { id: 7, name: 'Zuri Satin Midi', category: 'dresses', price: 76000, image: '/images/dress.png', tag: 'New', position: 'center 15%' },
  { id: 8, name: 'Ada Occasion Dress', category: 'dresses', price: 89000, image: '/images/dress.png', tag: 'Bestseller', position: 'center 30%' },
  { id: 9, name: 'Efe Wrap Dress', category: 'dresses', price: 72000, image: '/images/dress.png', tag: '', position: 'center 42%' }
];

const state = { filter: 'all', search: '', cart: [], favorites: new Set() };
const grid = document.querySelector('#product-grid');
const noResults = document.querySelector('#no-results');
const money = value => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

function productCard(product) {
  return `<article class="product-card" data-category="${product.category}">
    <div class="product-image">
      ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
      <button class="heart ${state.favorites.has(product.id) ? 'liked' : ''}" data-favorite="${product.id}" aria-label="Save ${product.name}">♡</button>
      <img src="${product.image}" alt="${product.name}" style="object-position:${product.position}" />
      <button class="quick-add" data-add="${product.id}">Add to bag <span>+</span></button>
    </div>
    <div class="product-info"><div><h3>${product.name}</h3><p>${product.category.slice(0, -1)}</p></div><strong>${money(product.price)}</strong></div>
  </article>`;
}

function renderProducts() {
  const query = state.search.toLowerCase().trim();
  const filtered = products.filter(p => (state.filter === 'all' || p.category === state.filter) && (!query || `${p.name} ${p.category}`.toLowerCase().includes(query)));
  grid.innerHTML = filtered.map(productCard).join('');
  noResults.hidden = filtered.length > 0;
}

function setFilter(filter) {
  state.filter = filter;
  document.querySelectorAll('.filter').forEach(button => button.classList.toggle('active', button.dataset.filter === filter));
  renderProducts();
}

document.querySelectorAll('[data-filter-link]').forEach(link => link.addEventListener('click', () => setFilter(link.dataset.filterLink)));
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));

grid.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  const favorite = event.target.closest('[data-favorite]');
  if (add) {
    const product = products.find(p => p.id === Number(add.dataset.add));
    state.cart.push(product);
    updateCart();
    showToast(`${product.name} added to your bag`);
  }
  if (favorite) {
    const id = Number(favorite.dataset.favorite);
    state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
    favorite.classList.toggle('liked');
    favorite.textContent = state.favorites.has(id) ? '♥' : '♡';
  }
});

function updateCart() {
  const count = state.cart.length;
  document.querySelector('#bag-count').textContent = count;
  document.querySelector('#bag-button').setAttribute('aria-label', `Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`);
  document.querySelector('#cart-summary').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  const items = document.querySelector('#cart-items');
  const foot = document.querySelector('#cart-foot');
  if (!count) {
    items.innerHTML = '<p class="empty-cart">Your bag is waiting for something nice.</p>';
    foot.hidden = true;
    return;
  }
  items.innerHTML = state.cart.map((p, index) => `<article class="cart-item"><img src="${p.image}" alt="" /><div><p>${p.name}</p><small>${p.category.slice(0, -1)}</small><strong>${money(p.price)}</strong></div><button data-remove="${index}" aria-label="Remove ${p.name}">×</button></article>`).join('');
  document.querySelector('#cart-total').textContent = money(state.cart.reduce((sum, p) => sum + p.price, 0));
  foot.hidden = false;
}

document.querySelector('#cart-items').addEventListener('click', event => {
  const remove = event.target.closest('[data-remove]');
  if (remove) { state.cart.splice(Number(remove.dataset.remove), 1); updateCart(); }
});

const cart = document.querySelector('#cart-drawer');
const overlay = document.querySelector('#overlay');
function openCart() { cart.classList.add('open'); cart.setAttribute('aria-hidden', 'false'); overlay.hidden = false; }
function closeCart() { cart.classList.remove('open'); cart.setAttribute('aria-hidden', 'true'); overlay.hidden = true; }
document.querySelector('#bag-button').addEventListener('click', openCart);
document.querySelector('#cart-close').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

const searchPanel = document.querySelector('#search-panel');
const searchInput = document.querySelector('#search-input');
function closeSearch() { searchPanel.hidden = true; state.search = ''; searchInput.value = ''; renderProducts(); }
document.querySelector('#search-toggle').addEventListener('click', () => { searchPanel.hidden = false; searchInput.focus(); });
document.querySelector('#search-close').addEventListener('click', closeSearch);
searchInput.addEventListener('input', event => { state.search = event.target.value; renderProducts(); document.querySelector('#shop').scrollIntoView({ behavior: 'smooth' }); });

const menuButton = document.querySelector('#menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileNav.hidden = open;
  document.body.classList.toggle('menu-open', !open);
});
mobileNav.addEventListener('click', () => { mobileNav.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); });

document.querySelector('#newsletter-form').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#form-message').textContent = 'Welcome to the Nicest circle — watch your inbox.';
  event.target.reset();
});

const toast = document.querySelector('#toast');
let toastTimer;
function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2600); }

document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeCart(); closeSearch(); } });
renderProducts();
