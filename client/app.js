/**
 * app.js
 * Client-side state and DOM rendering for the Spare Parts Inventory page.
 * Imports data access from api.js and never fetches directly — keeps
 * network logic and DOM logic in separate, testable modules.
 */

import { fetchProducts, fetchCategories } from './api.js';

const CART_STORAGE_KEY = 'rsrtc-inventory-cart';

/** Central client state */
const state = {
  allProducts: [],
  categories: ['all'],
  activeCategory: 'all',
  searchTerm: '',
  sortOrder: 'default', // 'default' | 'price-asc' | 'price-desc' | 'name-asc'
  cart: loadCartFromStorage(),
};

// ---- DOM references ----
const els = {
  grid: document.getElementById('product-grid'),
  searchInput: document.getElementById('inventory-search'),
  sortSelect: document.getElementById('inventory-sort'),
  categoryTabs: document.getElementById('category-tabs'),
  errorBanner: document.getElementById('error-banner'),
  errorMessage: document.getElementById('error-message'),
  errorRetry: document.getElementById('error-retry'),
  cartButton: document.getElementById('cart-button'),
  cartCount: document.getElementById('cart-count'),
  cartDrawer: document.getElementById('cart-drawer'),
  cartDrawerOverlay: document.getElementById('cart-drawer-overlay'),
  cartItems: document.getElementById('cart-items'),
  cartClose: document.getElementById('cart-close'),
};

// ==========================================================================
// localStorage cart persistence
// ==========================================================================

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Could not read cart from storage:', err);
    return [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
  } catch (err) {
    console.error('Could not save cart to storage:', err);
  }
}

// ==========================================================================
// Error banner
// ==========================================================================

function showError(message, onRetry) {
  els.errorMessage.textContent = message;
  els.errorBanner.classList.add('is-visible');
  els.errorRetry.onclick = () => {
    hideError();
    if (onRetry) onRetry();
  };
}

function hideError() {
  els.errorBanner.classList.remove('is-visible');
}

// ==========================================================================
// Loading skeletons
// ==========================================================================

function renderSkeletons(count = 8) {
  els.grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
      <div class="skeleton-block image"></div>
      <div class="skeleton-block line"></div>
      <div class="skeleton-block line short"></div>
    `;
    els.grid.appendChild(card);
  }
}

// ==========================================================================
// Product grid rendering
// ==========================================================================

function renderProducts(products) {
  els.grid.innerHTML = '';

  if (products.length === 0) {
    els.grid.innerHTML = '<p class="empty-state">No parts match your search and filters.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${escapeHtml(product.title)}" loading="lazy">
      <p class="category-label">${escapeHtml(product.category)}</p>
      <h3>${escapeHtml(product.title)}</h3>
      <p class="price">$${product.price.toFixed(2)}</p>
      <button type="button" class="btn-secondary" data-add-to-cart="${product.id}">
        Add to cart
      </button>
    `;
    fragment.appendChild(card);
  });

  els.grid.appendChild(fragment);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================================================
// Filtering + sorting (pure functions over state.allProducts)
// ==========================================================================

function getVisibleProducts() {
  let list = [...state.allProducts];

  if (state.activeCategory !== 'all') {
    list = list.filter((p) => p.category === state.activeCategory);
  }

  if (state.searchTerm.trim() !== '') {
    const term = state.searchTerm.trim().toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(term));
  }

  switch (state.sortOrder) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break; // keep API order
  }

  return list;
}

function applyFiltersAndRender() {
  renderProducts(getVisibleProducts());
}

// ==========================================================================
// Category tabs
// ==========================================================================

function renderCategoryTabs() {
  els.categoryTabs.innerHTML = '';
  state.categories.forEach((category) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = category === 'all' ? 'All parts' : category;
    btn.setAttribute('aria-pressed', String(category === state.activeCategory));
    btn.addEventListener('click', () => {
      state.activeCategory = category;
      renderCategoryTabs();
      applyFiltersAndRender();
    });
    els.categoryTabs.appendChild(btn);
  });
}

// ==========================================================================
// Cart
// ==========================================================================

function addToCart(productId) {
  const product = state.allProducts.find((p) => p.id === Number(productId));
  if (!product) return;

  const existing = state.cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: product.id, title: product.title, price: product.price, qty: 1 });
  }

  saveCartToStorage();
  renderCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.id !== Number(productId));
  saveCartToStorage();
  renderCart();
}

function renderCart() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  els.cartCount.textContent = String(totalCount);

  if (state.cart.length === 0) {
    els.cartItems.innerHTML = '<p class="empty-state">Your cart is empty.</p>';
    return;
  }

  els.cartItems.innerHTML = '';
  state.cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <span>${escapeHtml(item.title)} &times; ${item.qty}</span>
      <button type="button" data-remove-from-cart="${item.id}">Remove</button>
    `;
    els.cartItems.appendChild(row);
  });
}

function openCartDrawer() {
  els.cartDrawer.classList.add('is-open');
  els.cartDrawerOverlay.classList.add('is-open');
  els.cartClose.focus();
}

function closeCartDrawer() {
  els.cartDrawer.classList.remove('is-open');
  els.cartDrawerOverlay.classList.remove('is-open');
  els.cartButton.focus();
}

// ==========================================================================
// Event wiring
// ==========================================================================

function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function attachEvents() {
  els.searchInput.addEventListener(
    'input',
    debounce((e) => {
      state.searchTerm = e.target.value;
      applyFiltersAndRender();
    }, 250)
  );

  els.sortSelect.addEventListener('change', (e) => {
    state.sortOrder = e.target.value;
    applyFiltersAndRender();
  });

  els.grid.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add-to-cart]');
    if (addBtn) {
      addToCart(addBtn.getAttribute('data-add-to-cart'));
    }
  });

  els.cartItems.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-remove-from-cart]');
    if (removeBtn) {
      removeFromCart(removeBtn.getAttribute('data-remove-from-cart'));
    }
  });

  els.cartButton.addEventListener('click', openCartDrawer);
  els.cartClose.addEventListener('click', closeCartDrawer);
  els.cartDrawerOverlay.addEventListener('click', closeCartDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && els.cartDrawer.classList.contains('is-open')) {
      closeCartDrawer();
    }
  });
}

// ==========================================================================
// Init
// ==========================================================================

async function loadInventory() {
  hideError();
  renderSkeletons();

  try {
    const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
    state.allProducts = products;
    state.categories = ['all', ...categories];
    renderCategoryTabs();
    applyFiltersAndRender();
  } catch (err) {
    console.error(err);
    els.grid.innerHTML = '';
    showError(
      'We could not load spare parts inventory right now. Check your connection and try again.',
      loadInventory
    );
  }
}

function init() {
  attachEvents();
  renderCart();
  loadInventory();
}

document.addEventListener('DOMContentLoaded', init);
