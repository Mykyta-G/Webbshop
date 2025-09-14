// Mobile navigation toggle & small enhancements
document.addEventListener('DOMContentLoaded', () => {
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

	// Expand/collapse all products
	const allProductsBtn = document.getElementById('toggleAllProducts');
	const allProductsSection = document.getElementById('allProducts');
	if (allProductsBtn && allProductsSection) {
		allProductsBtn.addEventListener('click', () => {
			const expanded = allProductsBtn.getAttribute('aria-expanded') === 'true';
			allProductsBtn.setAttribute('aria-expanded', String(!expanded));
			allProductsSection.classList.toggle('hidden', expanded);
			allProductsBtn.textContent = expanded ? 'Browse →' : 'Stäng ↑';
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

	const cart = new Map(); // key: productId, value: { id, name, price, qty }

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

	function formatCurrency(n){ return n + ' kr'; }

	function renderCart(){
		cartItemsEl.innerHTML = '';
		let total = 0; let count = 0;
		if (cart.size === 0){
			emptyMsg.classList.remove('hidden');
		} else {
			emptyMsg.classList.add('hidden');
			cart.forEach(item => {
				total += item.price * item.qty; count += item.qty;
				const row = document.createElement('div');
				row.className = 'flex items-start justify-between gap-3 border border-neutral-200 rounded p-2';
				row.innerHTML = `<div class="text-xs flex-1"><p class="font-medium text-neutral-800">${item.name}</p><p class="text-neutral-500">${item.price} kr × ${item.qty}</p></div><div class="flex items-center gap-1"><button data-dec="${item.id}" class="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100">-</button><button data-inc="${item.id}" class="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100">+</button><button data-del="${item.id}" class="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100" aria-label="Remove">×</button></div>`;
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
		if (cart.has(product.id)) cart.get(product.id).qty += 1; else cart.set(product.id,{...product, qty:1});
		renderCart();
	}

	function adjustQty(id, delta){
		if(!cart.has(id)) return; const item = cart.get(id); item.qty += delta; if(item.qty<=0) cart.delete(id); renderCart();
	}

	cartBtn?.addEventListener('click', openCart);
	closeCartBtn?.addEventListener('click', closeCart);
	cartOverlay?.addEventListener('click', closeCart);

	checkoutBtn?.addEventListener('click', () => {
		if(cart.size===0) return; alert('Checkout not implemented. Total: '+cartTotalEl.textContent); closeCart();
	});

	cartItemsEl?.addEventListener('click', e => {
		const t = e.target; if(!(t instanceof HTMLElement)) return;
		if (t.dataset.inc) adjustQty(t.dataset.inc, 1);
		else if (t.dataset.dec) adjustQty(t.dataset.dec, -1);
		else if (t.dataset.del) { cart.delete(t.dataset.del); renderCart(); }
	});

	document.querySelectorAll('.add-to-cart').forEach(btn => {
		btn.addEventListener('click', () => {
			const card = btn.closest('[data-product-id]');
			if(!card) return;
			const product = {
				id: card.getAttribute('data-product-id'),
				name: card.getAttribute('data-product-name'),
				price: Number(card.getAttribute('data-product-price'))
			};
			addToCart(product);
		});
	});

	// Initial render
	renderCart();
});
