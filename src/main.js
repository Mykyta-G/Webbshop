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
});
