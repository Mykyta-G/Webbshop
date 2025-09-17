async function loadProducts() {
  try {
    // Same-origin fetch (server runs at 5500 and serves frontend). Avoid hardcoding port.
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const products = await response.json();
    console.log(products);
    const container = document.getElementById('productList');
    if (!container) return;

    const cards = (products || []).map(product => {
      const id = product.id;
      const name = product.name || 'Product';
      const price = Number(product.price) || 0;
      const imgRaw = (product.image || '').trim();
      let imgSrc = '/media/temp.png';
      if (imgRaw) {
        if (imgRaw.startsWith('http://') || imgRaw.startsWith('https://') || imgRaw.startsWith('/')) {
          imgSrc = imgRaw;
        } else if (imgRaw.startsWith('media/')) {
          imgSrc = '/' + imgRaw.replace(/^\/+/, '');
        } else {
          imgSrc = '/media/' + imgRaw.replace(/^\/+/, '');
        }
      }
      return `
        <div class="rounded border-2 border-dashed border-neutral-400 bg-neutral-50 p-2 flex flex-col" 
             data-product-id="${id}" data-product-name="${name}" data-product-price="${price}">
          <img src="${imgSrc}" alt="${name}" class="w-full h-auto block mb-2" loading="lazy">
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
      // Delegate to main.js which listens globally
    });
  } catch (e) {
    console.error('Error fetching products:', e);
  }
}

window.addEventListener('DOMContentLoaded', loadProducts);