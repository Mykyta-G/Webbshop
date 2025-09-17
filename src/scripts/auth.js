// Simple frontend auth UI helper
(function () {
  function getUser() {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function ensureAdminNavLinks(user) {
    // Only for admins
    if (!user || !user.is_admin) return;

    // Desktop nav: header nav[aria-label="Main"] ul
    const desktopUl = document.querySelector('header nav[aria-label="Main"] ul');
    if (desktopUl && !desktopUl.querySelector('#adminNavLink')) {
      const li = document.createElement('li');
      li.id = 'adminNavLink';
      const a = document.createElement('a');
      a.href = '/admin';
      a.className = 'nav-link hover:text-neutral-900 transition';
      a.textContent = 'Admin';
      li.appendChild(a);
      desktopUl.appendChild(li);
    }

    // Mobile nav (only exists on index.html): #mobileMenu ul
    const mobileUl = document.querySelector('#mobileMenu ul');
    if (mobileUl && !mobileUl.querySelector('#adminMobileNavLink')) {
      const li = document.createElement('li');
      li.id = 'adminMobileNavLink';
      const a = document.createElement('a');
      a.href = '/admin';
      a.className = 'block px-2 py-1 rounded hover:bg-neutral-200';
      a.textContent = 'Admin';
      li.appendChild(a);
      mobileUl.appendChild(li);
    }
  }

  function removeAdminNavLinks() {
    const ids = ['adminNavLink', 'adminMobileNavLink'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  function findHeaderActionsContainer() {
    // Prefer parent of profile/logout/cart buttons if present
    const profile = document.getElementById('profileButton');
    if (profile && profile.parentElement) return profile.parentElement;
    const logout = document.getElementById('logoutButton');
    if (logout && logout.parentElement) return logout.parentElement;
    const cartBtn = document.getElementById('cartButton');
    if (cartBtn && cartBtn.parentElement) return cartBtn.parentElement;
    // Fallback: right-most child inside header bar
    const headerBar = document.querySelector('header .max-w-6xl');
    if (headerBar) {
      const candidates = headerBar.querySelectorAll(':scope > div');
      if (candidates.length) return candidates[candidates.length - 1];
    }
    return null;
  }

  function ensureAdminHeaderButton(user) {
    if (!user || !user.is_admin) return;
    const container = findHeaderActionsContainer();
    if (!container) return;
    if (document.getElementById('adminHeaderButton')) return;
    const a = document.createElement('a');
    a.id = 'adminHeaderButton';
    a.href = '/admin';
    a.className = 'relative p-2 rounded border border-dashed border-neutral-400 text-[10px] tracking-wide text-neutral-600 hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-neutral-400';
    a.textContent = 'ADMIN';
    container.insertBefore(a, container.firstChild);
  }

  function removeAdminHeaderButton() {
    const el = document.getElementById('adminHeaderButton');
    if (el) el.remove();
  }

  function createLogoutButton() {
    const btn = document.createElement('button');
    btn.id = 'logoutButton';
    btn.type = 'button';
    btn.className = 'relative p-2 rounded border border-dashed border-neutral-400 text-[10px] tracking-wide text-neutral-500 hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-neutral-400';
    btn.textContent = 'LOGOUT';
    btn.addEventListener('click', () => {
      localStorage.removeItem('user');
      // Optionally also clear cart/session in the future
      window.location.reload();
    });
    return btn;
  }

  function updateHeaderAuthUI() {
    const user = getUser();
    const profileEl = document.getElementById('profileButton');
    if (user) {
      // Replace profile anchor/icon with a small LOGOUT button if present
      if (profileEl) {
        const logoutBtn = createLogoutButton();
        profileEl.replaceWith(logoutBtn);
      }
      if (user.is_admin) {
        ensureAdminNavLinks(user);
        ensureAdminHeaderButton(user);
      } else {
        removeAdminNavLinks();
        removeAdminHeaderButton();
      }
    } else {
      // Not logged in: ensure the element is an anchor to /login (if present)
      if (profileEl) {
        if (profileEl.tagName !== 'A') {
          const a = document.createElement('a');
          a.id = 'profileButton';
          a.href = '/login';
          a.className = 'inline-flex items-center justify-center w-9 h-9 rounded-full border border-dashed border-neutral-400 hover:bg-white/40 transition focus:outline-none focus:ring-2 focus:ring-neutral-400';
          a.setAttribute('aria-label', 'Log in');
          a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5 text-neutral-700" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 20.25a8.25 8.25 0 1115 0v.75H4.5v-.75z" /></svg>';
          profileEl.replaceWith(a);
        } else {
          // Ensure it points to /login
          profileEl.setAttribute('href', '/login');
        }
      }
      removeAdminNavLinks();
      removeAdminHeaderButton();
    }
  }

  document.addEventListener('DOMContentLoaded', updateHeaderAuthUI);
})();
