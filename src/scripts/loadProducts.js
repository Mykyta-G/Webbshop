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
        <div class="product-card rounded border-2 border-dashed border-neutral-400 bg-neutral-50 p-2" 
             data-product-id="${id}" data-product-name="${name}" data-product-price="${price}">
          <div class="product-image-container mb-2">
            <img src="${imgSrc}" alt="${name}" class="product-image" loading="lazy">
          </div>
          <div class="product-info">
            <div class="flex items-center justify-between text-xs mb-2">
              <span>${name}</span>
              <span class="text-neutral-500">${price} kr</span>
            </div>
            <button class="w-full text-xs border border-neutral-400 rounded px-2 py-1 add-to-cart">Add</button>
          </div>
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

async function loadHotProducts() {
  try {
    const response = await fetch('/api/products/hot');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const hotProducts = await response.json();
    console.log('Hot products:', hotProducts);
    const container = document.getElementById('hotProductsList');
    if (!container) return;

    if (hotProducts.length === 0) {
      // Hide the hot products section if no hot products
      const hotSection = document.getElementById('hotProductsSection');
      if (hotSection) hotSection.style.display = 'none';
      return;
    }

    const cards = hotProducts.map(product => {
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
        <div class="product-card rounded border-2 border-dashed border-neutral-400 bg-neutral-50 p-2" 
             data-product-id="${id}" data-product-name="${name}" data-product-price="${price}">
          <div class="product-image-container mb-2">
            <img src="${imgSrc}" alt="${name}" class="product-image" loading="lazy">
          </div>
          <div class="product-info">
            <div class="flex items-center justify-between text-xs mb-2">
              <span>${name}</span>
              <span class="text-neutral-500">${price} kr</span>
            </div>
            <button class="w-full text-xs border border-neutral-400 rounded px-2 py-1 add-to-cart">Add</button>
          </div>
        </div>`;
    }).join('');
    container.innerHTML = cards;

    // Update the count in the hot section header
    const countSpan = document.querySelector('#hotProductsSection .text-sm');
    if (countSpan) {
      countSpan.textContent = `(${hotProducts.length} AVAILABLE)`;
    }

    // Show the hot products section
    const hotSection = document.getElementById('hotProductsSection');
    if (hotSection) hotSection.style.display = 'block';

    // Delegate click for dynamically added buttons so main.js cart can work
    container.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.classList.contains('add-to-cart')) return;
      // Delegate to main.js which listens globally
    });
  } catch (e) {
    console.error('Error fetching hot products:', e);
  }
}

window.addEventListener('DOMContentLoaded', loadProducts);