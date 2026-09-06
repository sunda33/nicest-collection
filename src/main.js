import './style.css';
import { isSupabaseConfigured, supabase } from './supabase.js';

const fallbackProducts = [
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

let products = fallbackProducts;
const state = { filter: 'all', search: '', cart: [], favorites: new Set(), session: null };
const grid = document.querySelector('#product-grid');
const noResults = document.querySelector('#no-results');
const authModal = document.querySelector('#auth-modal');
const checkoutModal = document.querySelector('#checkout-modal');
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
  const filtered = products.filter(product =>
    (state.filter === 'all' || product.category === state.filter)
    && (!query || `${product.name} ${product.category}`.toLowerCase().includes(query))
  );
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
    const product = products.find(item => item.id === Number(add.dataset.add));
    if (!product) return;
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
  items.innerHTML = state.cart.map((product, index) => `<article class="cart-item"><img src="${product.image}" alt="" /><div><p>${product.name}</p><small>${product.category.slice(0, -1)}</small><strong>${money(product.price)}</strong></div><button data-remove="${index}" aria-label="Remove ${product.name}">×</button></article>`).join('');
  document.querySelector('#cart-total').textContent = money(state.cart.reduce((sum, product) => sum + product.price, 0));
  foot.hidden = false;
}

document.querySelector('#cart-items').addEventListener('click', event => {
  const remove = event.target.closest('[data-remove]');
  if (remove) {
    state.cart.splice(Number(remove.dataset.remove), 1);
    updateCart();
  }
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
searchInput.addEventListener('input', event => {
  state.search = event.target.value;
  renderProducts();
  document.querySelector('#shop').scrollIntoView({ behavior: 'smooth' });
});

const menuButton = document.querySelector('#menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileNav.hidden = open;
  document.body.classList.toggle('menu-open', !open);
});
mobileNav.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
});

document.querySelector('#newsletter-form').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#form-message').textContent = 'Welcome to the Nicest circle — watch your inbox.';
  event.target.reset();
});

const toast = document.querySelector('#toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function updateAuthUI() {
  const accountButton = document.querySelector('#account-button');
  const authForm = document.querySelector('#auth-form');
  const signedInPanel = document.querySelector('#signed-in-panel');
  const email = state.session?.user?.email;
  accountButton.textContent = email ? 'Account' : 'Sign in';
  authForm.hidden = Boolean(email);
  signedInPanel.hidden = !email;
  document.querySelector('#signed-in-email').textContent = email ? `Signed in as ${email}` : '';
}

document.querySelector('#account-button').addEventListener('click', () => {
  updateAuthUI();
  authModal.showModal();
});

document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => {
  document.querySelector(`#${button.dataset.closeDialog}`).close();
}));

document.querySelector('#auth-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!supabase) return showToast('Account service is not configured.');
  const message = document.querySelector('#auth-message');
  message.textContent = 'Signing you in…';
  const { error } = await supabase.auth.signInWithPassword({
    email: document.querySelector('#auth-email').value,
    password: document.querySelector('#auth-password').value
  });
  message.textContent = error ? error.message : 'Signed in successfully.';
  if (!error) setTimeout(() => authModal.close(), 500);
});

document.querySelector('#signup-button').addEventListener('click', async () => {
  if (!supabase) return showToast('Account service is not configured.');
  const email = document.querySelector('#auth-email').value;
  const password = document.querySelector('#auth-password').value;
  const message = document.querySelector('#auth-message');
  if (!email || password.length < 6) {
    message.textContent = 'Enter a valid email and a password of at least 6 characters.';
    return;
  }
  message.textContent = 'Creating your account…';
  const { data, error } = await supabase.auth.signUp({ email, password });
  message.textContent = error
    ? error.message
    : data.session
      ? 'Your account is ready.'
      : 'Check your email to confirm your account, then sign in.';
});

document.querySelector('#signout-button').addEventListener('click', async () => {
  if (supabase) await supabase.auth.signOut();
  authModal.close();
  showToast('You are signed out.');
});

document.querySelector('#checkout-button').addEventListener('click', () => {
  if (!isSupabaseConfigured) return showToast('Checkout is not configured yet.');
  if (!state.session) {
    closeCart();
    authModal.showModal();
    showToast('Sign in before placing your order.');
    return;
  }
  closeCart();
  checkoutModal.showModal();
});

document.querySelector('#checkout-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!supabase || !state.session || !state.cart.length) return;
  const button = document.querySelector('#place-order-button');
  const message = document.querySelector('#order-message');
  const groupedItems = Array.from(state.cart.reduce((map, product) => {
    const item = map.get(product.id) || { product_id: product.id, quantity: 0 };
    item.quantity += 1;
    map.set(product.id, item);
    return map;
  }, new Map()).values());
  button.disabled = true;
  message.textContent = 'Placing your order…';
  const { data: orderId, error } = await supabase.rpc('place_order', {
    p_customer_name: document.querySelector('#customer-name').value,
    p_phone: document.querySelector('#customer-phone').value,
    p_delivery_address: document.querySelector('#delivery-address').value,
    p_items: groupedItems
  });
  button.disabled = false;
  if (error) {
    message.textContent = error.message;
    return;
  }
  state.cart = [];
  updateCart();
  event.target.reset();
  message.textContent = `Order ${String(orderId).slice(0, 8).toUpperCase()} received.`;
  showToast('Your order has been placed successfully.');
  setTimeout(() => checkoutModal.close(), 1200);
});

async function initializeStore() {
  renderProducts();
  updateCart();
  updateAuthUI();
  if (!supabase) return;

  const [{ data: authData }, { data: productData, error: productError }] = await Promise.all([
    supabase.auth.getSession(),
    supabase.from('products').select('id,name,category,price,image,tag,position').eq('is_active', true).order('id')
  ]);
  state.session = authData.session;
  if (!productError && productData?.length) products = productData;
  updateAuthUI();
  renderProducts();

  supabase.auth.onAuthStateChange((_event, session) => {
    state.session = session;
    updateAuthUI();
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeCart();
    closeSearch();
  }
});

initializeStore();
