async function loadProducts() {
  try {
    // Same-origin fetch (server runs at 5500 and serves frontend). Avoid hardcoding port.
    const response = await fetch('http://localhost:3000/api/products');
    const products = await response.json();
    console.log(products);
    const container = document.getElementById("productList");
    
    products.forEach(product => {
        const productCard = `
          <div class="rounded border-2 border-dashed border-neutral-400 bg-neutral-50 p-2 flex flex-col">
            <img src="media/${product.image || "temp.png"}" alt="Glow Spinner" class="w-full h-auto block mb-2" loading="lazy">
            <div class="flex items-center justify-between text-xs">
              <span>${product.name}</span>
              <span class="text-neutral-500">${product.price} kr</span>
            </div>
            <button class="mt-2 text-xs border border-neutral-400 rounded px-2 py-1 add-to-cart">Add</button>
          </div>`;

          container.innerHTML += productCard;
    });
  }
  catch (err) {
    console.error('Failed to load products:', err);
  }
}
window.addEventListener('DOMContentLoaded', loadProducts);