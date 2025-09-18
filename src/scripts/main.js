

// Mobile navigation toggle & small enhancements
document.addEventListener('DOMContentLoaded', () => {
	try {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}
		if (!location.hash) {
			const root = document.documentElement;
			const hadInline = !!root.getAttribute('style');
			const prevInline = root.style.scrollBehavior;
			root.style.scrollBehavior = 'auto';
			requestAnimationFrame(() => {
				window.scrollTo(0,0);
				if (prevInline) root.style.scrollBehavior = prevInline; else root.style.removeProperty('scroll-behavior');
				if (!hadInline && !root.getAttribute('style')) root.removeAttribute('style');
			});
		}
	} catch(e) { /* fail silently */ }
	const toggle = document.querySelector('.nav-toggle');
	const mobileMenu = document.getElementById('mobileMenu');
	const yearSpan = document.getElementById('year');

	if (yearSpan) yearSpan.textContent = new Date().getFullYear();

	if (toggle && mobileMenu) {
		toggle.addEventListener('click', () => {
			const isOpen = toggle.getAttribute('aria-expanded') === 'true';
			toggle.setAttribute('aria-expanded', String(!isOpen));
			mobileMenu.classList.toggle('hidden');
		});
		// Close on nav click (improves UX)
		mobileMenu.querySelectorAll('a').forEach(a => {
			a.addEventListener('click', () => {
				mobileMenu.classList.add('hidden');
				toggle.setAttribute('aria-expanded', 'false');
			});
		});
	}

	// Simple cart logic (in-memory)
	const cartBtn = document.getElementById('cartButton');
	const cartPanel = document.getElementById('cartPanel');
	const cartOverlay = document.getElementById('cartOverlay');
	const closeCartBtn = document.getElementById('closeCart');
	const cartItemsEl = document.getElementById('cartItems');
	const emptyMsg = document.getElementById('emptyCartMsg');
	const cartTotalEl = document.getElementById('cartTotal');
	const cartCountEl = document.getElementById('cartCount');
	const checkoutBtn = document.getElementById('checkoutBtn');

	 // key: productId, value: { id, name, price, qty }

	function openCart(){
		cartPanel.classList.remove('translate-x-full');
		cartOverlay.classList.remove('hidden');
		cartBtn?.setAttribute('aria-expanded','true');
	}
	function closeCart(){
		cartPanel.classList.add('translate-x-full');
		cartOverlay.classList.add('hidden');
		cartBtn?.setAttribute('aria-expanded','false');
	}
	function getCart() {
		try {
			return JSON.parse(localStorage.getItem("cart")) || [];
		} catch(e){
			return [];
		}
	}

	function formatCurrency(n){ return n + ' kr'; }

	function renderCart(){
		let cart = getCart();
		cartItemsEl.innerHTML = '';
		let total = 0; let count = 0;
		if (cart.length === 0){
			emptyMsg.classList.remove('hidden');
		} else {
			emptyMsg.classList.add('hidden');
			cart.forEach(item => {
				total += item.price * item.quantity; count += item.quantity;
				const row = document.createElement('div');
				row.className = 'flex items-start justify-between gap-3 border border-neutral-200 rounded p-2';
				row.innerHTML = `<div class="text-xs flex-1"><p class="font-medium text-neutral-800">${item.name}</p><p class="text-neutral-500">${item.price} kr × ${item.quantity}</p></div><div class="flex items-center gap-1"><button data-dec="${item.id}" class="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100">-</button><button data-inc="${item.id}" class="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100">+</button><button data-del="${item.id}" class="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100" aria-label="Remove">×</button></div>`;
				cartItemsEl.appendChild(row);
			});
		}
		cartTotalEl.textContent = formatCurrency(total);
		if (count>0){
			cartCountEl.textContent = String(count);
			cartCountEl.classList.remove('hidden');
			checkoutBtn.disabled = false;
		} else {
			cartCountEl.classList.add('hidden');
			checkoutBtn.disabled = true;
		}
	}

	function addToCart(product){
		let cart = getCart();
  
    	// Check if product already in cart
    	const existing = cart.find(item => item.id === product.id);
    	if (existing) {
      		existing.quantity += 1; // Increase quantity
    	} else {
      		cart.push({ ...product, quantity: 1 });
    	}
  
    	localStorage.setItem("cart", JSON.stringify(cart));
		renderCart();
	}

	function adjustQty(id, delta) {
	  console.log("Starting adjusting quantity")
      const cart = getCart();
      if (!cart || cart.length === 0) return;

      // find the item index. Use string comparison to be forgiving about id types.
      const idx = cart.findIndex(item => String(item.id) === String(id));
      if (idx === -1) return; // item not found

      // compute new quantity safely
      const currentQty = Number(cart[idx].quantity) || 0;
      const newQty = currentQty + Number(delta);

      if (newQty <= 0) {
        // remove the item
        cart.splice(idx, 1);
      } else {
        // update quantity
		console.log(cart[idx].quantity);
        cart[idx].quantity = newQty;
		console.log(cart[idx].quantity);
		console.log("updating quantity");
      }
	  console.log("finished adjusting quantity")
	  localStorage.setItem("cart", JSON.stringify(cart));
		renderCart();
	}

	function removeFromCart(id) {
		const cart = getCart();

  		// Filter out the item you want to remove
  		const updatedCart = cart.filter(item => String(item.id) !== String(id));

  		// Save updated cart back to localStorage
  		localStorage.setItem("cart", JSON.stringify(updatedCart));
	}

	cartBtn?.addEventListener('click', openCart);
	closeCartBtn?.addEventListener('click', closeCart);
	cartOverlay?.addEventListener('click', closeCart);

	checkoutBtn?.addEventListener('click', () => {
		const cart = getCart();
		if (!cart || cart.length === 0) return;
			// Navigate to checkout page (HTMLs are now served from /src at site root)
			window.location.href = '/checkout.html';
	});

	cartItemsEl?.addEventListener('click', e => {
		const t = e.target; if(!(t instanceof HTMLElement)) return;
		if (t.dataset.inc) adjustQty(t.dataset.inc, 1);
		else if (t.dataset.dec) adjustQty(t.dataset.dec, -1);
		else if (t.dataset.del) { removeFromCart(t.dataset.del); renderCart(); }
	});

	// Event delegation for dynamically injected product cards
	document.addEventListener('click', (e) => {
		const target = e.target;
		if (!(target instanceof HTMLElement)) return;
		const btn = target.closest('.add-to-cart');
		if (!btn) return;
		const card = btn.closest('[data-product-id]');
		if (!card) return;
		const product = {
			id: card.getAttribute('data-product-id'),
			name: card.getAttribute('data-product-name'),
			price: Number(card.getAttribute('data-product-price'))
		};
		addToCart(product);
	});

	// Initial render
	renderCart();

	// Hero layout toggler (restore if hero variants are re-added later)
	
	loadProducts();
	loadHotProducts();
});
