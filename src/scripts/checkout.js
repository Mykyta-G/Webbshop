// Checkout page script: renders cart summary, handles quantities, totals, and form submit
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const yearSpan = $('#year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // mobile menu
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function getCart(){
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  }
  function setCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); }
  function money(n){ return `${n} kr`; }

  const summaryItems = $('#summaryItems');
  const emptyMsg = $('#emptyMsg');
  const subtotalEl = $('#summarySubtotal');
  const totalEl = $('#summaryTotal');
  const cartCountEl = $('#cartCount');

  function compute(cart){
    let subtotal = 0, count = 0;
    cart.forEach(i => { subtotal += (Number(i.price)||0) * (Number(i.quantity)||0); count += (Number(i.quantity)||0); });
    return { subtotal, count };
  }

  function render(){
    const cart = getCart();
    summaryItems.innerHTML = '';
    const { subtotal, count } = compute(cart);

    if (cart.length === 0) {
      emptyMsg.classList.remove('hidden');
    } else {
      emptyMsg.classList.add('hidden');
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'flex items-start justify-between gap-3 border border-neutral-200 rounded p-2';
        row.innerHTML = `
          <div class="text-xs flex-1">
            <p class="font-medium text-neutral-800">${item.name}</p>
            <p class="text-neutral-500">${item.price} kr × ${item.quantity}</p>
          </div>
          <div class="flex items-center gap-1">
            <button data-dec="${item.id}" class="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100">-</button>
            <button data-inc="${item.id}" class="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100">+</button>
            <button data-del="${item.id}" class="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100" aria-label="Remove">×</button>
          </div>
        `;
        summaryItems.appendChild(row);
      });
    }

    subtotalEl.textContent = money(subtotal);
    totalEl.textContent = money(subtotal); // shipping free

    if (count>0){
      cartCountEl.textContent = String(count);
      cartCountEl.classList.remove('hidden');
    } else {
      cartCountEl.classList.add('hidden');
    }
  }

  // quantity controls
  summaryItems?.addEventListener('click', (e) => {
    const t = e.target; if(!(t instanceof HTMLElement)) return;
    const id = t.dataset.inc || t.dataset.dec || t.dataset.del;
    if (!id) return;

    let cart = getCart();
    const idx = cart.findIndex(i => String(i.id) === String(id));
    if (idx === -1) return;

    if (t.dataset.inc) {
      cart[idx].quantity = (Number(cart[idx].quantity)||0) + 1;
    } else if (t.dataset.dec) {
      const newQty = (Number(cart[idx].quantity)||0) - 1;
      if (newQty <= 0) cart.splice(idx, 1); else cart[idx].quantity = newQty;
    } else if (t.dataset.del) {
      cart.splice(idx, 1);
    }

    setCart(cart);
    render();
  });

  // handle form submit -> populate hidden fields and let native POST happen
  const form = $('#checkoutForm');
  form?.addEventListener('submit', (e) => {
    const cart = getCart();
    if (cart.length === 0) {
      e.preventDefault();
      alert('Your cart is empty.');
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const { subtotal } = compute(cart);

    // Hidden fields
    const subject = $('#subjectInput');
    const replyTo = $('#replyTo');
    const orderTotal = $('#orderTotal');
    const orderPayload = $('#orderPayload');

    if (replyTo) replyTo.value = data.email || '';
    if (orderTotal) orderTotal.value = String(subtotal);

    // Compact order payload as JSON
    const payload = {
      customer: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        zip: data.zip,
        city: data.city,
        notes: data.notes || ''
      },
      items: cart,
      total: subtotal,
      createdAt: new Date().toISOString()
    };
    if (orderPayload) orderPayload.value = JSON.stringify(payload);

    // Clear cart after a small delay post-submit using onsubmit event's default navigation
    // Note: We do not preventDefault here; Formspree will handle the POST/redirect.
    setTimeout(() => {
      localStorage.removeItem('cart');
    }, 500);
  });

  // initial render
  render();
})();
