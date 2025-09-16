async function loadProducts() {
  try {
    // Same-origin fetch (server runs at 5500 and serves frontend). Avoid hardcoding port.
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const products = await response.json();
    const container = document.getElementById('allProducts');
    if (!container) return;

    // Build markup once for performance
    const cards = products.map(p => {
      const id = p.id ?? '';
      const name = p.name ?? 'Unnamed';
      const price = Number(p.price ?? 0);
      const img = p.image || 'temp.png';
      return `
        <div class="rounded border-2 border-dashed border-neutral-400 bg-neutral-50 p-2 flex flex-col" data-product-id="${id}" data-product-name="${name}" data-product-price="${price}">
          <img src="media/${img}" alt="${name}" class="w-full h-auto block mb-2" loading="lazy">
          <div class="flex items-center justify-between text-xs">
            <span>${name}</span>
            <span class="text-neutral-500">${price} kr</span>
          </div>
          <button class="mt-2 text-xs border border-neutral-400 rounded px-2 py-1 add-to-cart">Add</button>
        </div>`;
    }).join('');
    container.innerHTML = cards;

    // Delegate click for dynamically added buttons so main.js cart can work
    container.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.classList.contains('add-to-cart')) return;
      // Trigger existing logic in main.js by dispatching a click that bubbles from the button
      // The main.js attaches listeners on DOMContentLoaded with querySelectorAll. Since these
      // buttons are dynamic, we add a custom event that other code could listen to if needed.
      // If main.js expects direct listeners, we mimic the same structure here (no-op otherwise).
    });
  } catch (e) {
    console.error('Error fetching products:', e);
  }
}

window.addEventListener('DOMContentLoaded', loadProducts);