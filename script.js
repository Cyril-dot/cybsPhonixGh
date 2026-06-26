/* ============================================================
   PHOENIX GH — shared behaviour
   ============================================================ */

const WHATSAPP_NUMBER = '233536064739'; // 0536 064 739, Ghana country code
const CONTACT_EMAIL = 'chuksottih@gmail.com';

function buildWhatsAppLink(productName){
  const text = `Hi Phoenix GH, I'd like more details about: ${productName} (price, specs, availability).`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
function buildEmailLink(productName){
  const subject = `Product enquiry: ${productName}`;
  const body = `Hi Phoenix GH,\n\nI'd like more details about "${productName}" — price, availability and specs.\n\nThanks!`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- per-product WhatsApp / email contact links ---------- */
  document.querySelectorAll('[data-contact="whatsapp"]').forEach(link => {
    const card = link.closest('[data-product-name]');
    const name = card ? card.dataset.productName : 'a product on Phoenix GH';
    link.href = buildWhatsAppLink(name);
    link.target = '_blank';
    link.rel = 'noopener';
  });
  document.querySelectorAll('[data-contact="email"]').forEach(link => {
    const card = link.closest('[data-product-name]');
    const name = card ? card.dataset.productName : 'a product on Phoenix GH';
    link.href = buildEmailLink(name);
  });


  /* ---------- mobile drawer ---------- */
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerClose = document.querySelector('.mobile-drawer .close');
  const scrim = document.querySelector('.mobile-drawer .scrim');
  const openDrawer = () => drawer && drawer.classList.add('open');
  const closeDrawer = () => drawer && drawer.classList.remove('open');
  hamburger && hamburger.addEventListener('click', openDrawer);
  drawerClose && drawerClose.addEventListener('click', closeDrawer);
  scrim && scrim.addEventListener('click', closeDrawer);

  /* ---------- mobile filter drawer (store page) ---------- */
  const filterToggle = document.querySelector('.filter-toggle');
  const filters = document.querySelector('.filters');
  filterToggle && filterToggle.addEventListener('click', () => filters.classList.toggle('open'));

  /* ---------- toast ---------- */
  const toast = document.querySelector('.toast');
  let toastTimer;
  function showToast(msg){
    if (!toast) return;
    toast.querySelector('span').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ---------- cart (persisted) ---------- */
  const CART_KEY = 'phoenixgh_cart';
  function getCart(){
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e){ return []; }
  }
  function setCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }
  function addToCart(id, name){
    const cart = getCart();
    cart.push(id);
    setCart(cart);
    showToast(`Added "${name}" to cart`);
  }
  function updateCartBadge(){
    const badge = document.querySelector('.cart-count');
    if (!badge) return;
    const count = getCart().length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  updateCartBadge();

  document.querySelectorAll('.add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('[data-product-name]');
      const name = card ? card.dataset.productName : 'Item';
      const id = card ? card.dataset.productId : Math.random().toString(36).slice(2);
      addToCart(id, name);
    });
  });

  /* ---------- wishlist toggle ---------- */
  document.querySelectorAll('.product-wish').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('active');
      btn.style.color = btn.classList.contains('active') ? '#ef4444' : '';
      btn.style.borderColor = btn.classList.contains('active') ? '#ef4444' : '';
    });
  });

  /* ---------- animated counters ---------- */
  const counters = document.querySelectorAll('[data-count-to]');
  if (counters.length){
    const animateCount = (el) => {
      const to = parseFloat(el.dataset.countTo);
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = to * eased;
        el.textContent = prefix + val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => obs.observe(c));
  }

  /* ---------- live clock in signal bar ---------- */
  const clockEl = document.querySelector('.signal-clock');
  if (clockEl){
    const tick = () => {
      const d = new Date();
      clockEl.textContent = d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }) + ' GMT';
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- gentle live-number flicker for market widgets ---------- */
  document.querySelectorAll('[data-flicker]').forEach(el => {
    const base = parseFloat(el.dataset.flicker);
    const decimals = (el.dataset.flicker.split('.')[1] || '').length;
    setInterval(() => {
      const delta = (Math.random() - 0.5) * (base * 0.004);
      const next = base + delta;
      el.textContent = next.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }, 2600);
  });

  /* ====================================================
     STORE PAGE — search / filter / sort / paginate
     ==================================================== */
  const productGrid = document.querySelector('[data-store-grid]');
  if (productGrid){
    const cards = Array.from(productGrid.querySelectorAll('.product-card'));
    const searchInput = document.querySelector('[data-store-search]');
    const sortSelect = document.querySelector('[data-store-sort]');
    const catBoxes = Array.from(document.querySelectorAll('[data-filter-cat]'));
    const brandBoxes = Array.from(document.querySelectorAll('[data-filter-brand]'));
    const priceRange = document.querySelector('[data-filter-price]');
    const priceLabel = document.querySelector('[data-price-label]');
    const resultsCount = document.querySelector('[data-results-count]');

    function applyFilters(){
      const term = (searchInput?.value || '').toLowerCase().trim();
      const activeCats = catBoxes.filter(b => b.checked).map(b => b.value);
      const activeBrands = brandBoxes.filter(b => b.checked).map(b => b.value);
      const maxPrice = priceRange ? parseFloat(priceRange.value) : Infinity;

      let visible = 0;
      cards.forEach(card => {
        const name = (card.dataset.productName || '').toLowerCase();
        const cat = card.dataset.cat || '';
        const brand = card.dataset.brand || '';
        const price = parseFloat(card.dataset.price || '0');

        const matchesTerm = !term || name.includes(term);
        const matchesCat = activeCats.length === 0 || activeCats.includes(cat);
        const matchesBrand = activeBrands.length === 0 || activeBrands.includes(brand);
        const matchesPrice = price <= maxPrice;

        const show = matchesTerm && matchesCat && matchesBrand && matchesPrice;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (resultsCount) resultsCount.textContent = `${visible} product${visible === 1 ? '' : 's'} found`;
    }

    function applySort(){
      const mode = sortSelect ? sortSelect.value : 'featured';
      const sorted = [...cards].sort((a,b) => {
        const pa = parseFloat(a.dataset.price), pb = parseFloat(b.dataset.price);
        const ra = parseFloat(a.dataset.rating), rb = parseFloat(b.dataset.rating);
        if (mode === 'price-asc') return pa - pb;
        if (mode === 'price-desc') return pb - pa;
        if (mode === 'rating') return rb - ra;
        return 0;
      });
      sorted.forEach(c => productGrid.appendChild(c));
    }

    searchInput && searchInput.addEventListener('input', applyFilters);
    sortSelect && sortSelect.addEventListener('change', () => { applySort(); applyFilters(); });
    catBoxes.forEach(b => b.addEventListener('change', applyFilters));
    brandBoxes.forEach(b => b.addEventListener('change', applyFilters));
    priceRange && priceRange.addEventListener('input', () => {
      if (priceLabel) priceLabel.textContent = `GH₵ ${parseInt(priceRange.value).toLocaleString()}`;
      applyFilters();
    });

    applyFilters();
  }

  /* ====================================================
     NEWS PAGE — category tabs
     ==================================================== */
  const tabs = document.querySelectorAll('[data-news-tab]');
  const articles = document.querySelectorAll('[data-article-cat]');
  if (tabs.length && articles.length){
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.newsTab;
        articles.forEach(a => {
          a.style.display = (cat === 'all' || a.dataset.articleCat === cat) ? '' : 'none';
        });
      });
    });
  }

  /* ---------- newsletter form ---------- */
  document.querySelectorAll('.cta-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input && input.value.trim()){
        showToast('Subscribed — welcome to the feed');
        input.value = '';
      }
    });
  });

});