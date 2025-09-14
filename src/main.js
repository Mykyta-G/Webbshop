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
});
