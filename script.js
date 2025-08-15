// Library LMS - Vanilla JS SPA
(function () {
  const state = {
    user: null,
    enrollments: new Set(JSON.parse(localStorage.getItem('enrollments') || '[]')),
    route: window.location.hash || '#/dashboard',
    query: ''
  };

  const els = {};

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
  function setBusy(isBusy) {
    const view = qs('#viewContainer');
    if (!view) return;
    view.setAttribute('aria-busy', String(isBusy));
  }
  function saveEnrollments() {
    localStorage.setItem('enrollments', JSON.stringify(Array.from(state.enrollments)));
  }
  function saveUser() {
    if (state.user) localStorage.setItem('user', JSON.stringify(state.user));
    else localStorage.removeItem('user');
  }
  function restoreUser() {
    try { state.user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { state.user = null; }
  }

  function formatMinutes(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }

  function renderSidebarCourses() {
    const container = qs('#sidebarCourses');
    if (!container) return;
    container.innerHTML = '';
    const courses = window.LMS_DATA.courses;
    courses.forEach(c => {
      const a = document.createElement('a');
      a.href = `#/courses/${c.id}`;
      a.className = 'sidebar-item';
      a.setAttribute('role', 'listitem');
      a.innerHTML = `<span class="dot" aria-hidden="true"></span><span>${c.title}</span>`;
      container.appendChild(a);
    });
    // Active state highlight
    const current = state.route;
    qsa('.sidebar-item', container).forEach(el => {
      if (el.getAttribute('href') === current) el.classList.add('active');
    });
  }

  function setActiveNav() {
    qsa('.nav-link').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === state.route);
    });
    // Also mark course title in sidebar
    const container = qs('#sidebarCourses');
    if (!container) return;
    qsa('.sidebar-item', container).forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === state.route);
    });
  }

  function render() {
    setBusy(true);
    const view = qs('#viewContainer');
    const [hash, id] = (state.route || '').replace('#/', '').split('/');
    let html = '';
    if (hash === 'courses' && id) {
      const course = window.LMS_DATA.courses.find(c => c.id === id);
      if (!course) html = `<div class="empty">Course not found.</div>`;
      else {
        const enrolled = state.enrollments.has(course.id);
        html = `
          <div class="toolbar">
            <button class="btn ghost" onclick="history.back()">← Back</button>
          </div>
          <div class="grid">
            <div class="col-8 col-12">
              <div class="card">
                <div class="cover"></div>
                <div class="body">
                  <div class="title">${course.title}</div>
                  <div class="meta">By ${course.author} • ${course.level} • ${formatMinutes(course.durationMinutes)}</div>
                  <div class="tags">${course.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
                  <p>${course.description}</p>
                  <div class="spacer-sm"></div>
                  <div>
                    <button class="btn primary" id="enrollBtn">${enrolled ? 'Continue' : 'Enroll'}</button>
                  </div>
                </div>
              </div>
              <div class="spacer-md"></div>
              <h3>Lessons</h3>
              <div class="card">
                <div class="body">
                  ${course.lessons.map((l, i) => `
                    <div class="lesson-row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
                      <div>${i + 1}. ${l.title}</div>
                      <div class="muted">${l.minutes}m</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>`;
      }
    } else if (hash === 'courses') {
      const list = window.LMS_DATA.courses
        .filter(c => c.title.toLowerCase().includes(state.query) || c.tags.some(t => t.includes(state.query)))
        .map(c => `
          <div class="col-3 col-6 col-12">
            <div class="card">
              <div class="cover"></div>
              <div class="body">
                <div class="title">${c.title}</div>
                <div class="meta">By ${c.author} • ${c.level} • ${formatMinutes(c.durationMinutes)}</div>
                <div class="tags">${c.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
                <div class="spacer-sm"></div>
                <div style="display:flex;gap:8px;">
                  <a class="btn primary" href="#/courses/${c.id}">View</a>
                  ${state.enrollments.has(c.id) ? `<a class="btn" href="#/courses/${c.id}">Continue</a>` : `<button class="btn" data-enroll="${c.id}">Enroll</button>`}
                </div>
              </div>
            </div>
          </div>
        `).join('');
      html = `
        <div class="toolbar">
          <h2>Course Catalog</h2>
          <div class="filters">
            ${window.LMS_DATA.tags.map(t => `<button class="chip" data-tag="${t}">${t}</button>`).join('')}
          </div>
        </div>
        <div class="grid">${list}</div>`;
    } else if (hash === 'my') {
      const enrolled = window.LMS_DATA.courses.filter(c => state.enrollments.has(c.id));
      if (enrolled.length === 0) {
        html = `<div class="empty">You have not enrolled in any courses yet.</div>`;
      } else {
        html = `<div class="grid">${enrolled.map(c => `
          <div class="col-4 col-6 col-12">
            <div class="card">
              <div class="cover"></div>
              <div class="body">
                <div class="title">${c.title}</div>
                <div class="meta">${c.author}</div>
                <div class="spacer-sm"></div>
                <div style="display:flex;gap:8px;">
                  <a class="btn primary" href="#/courses/${c.id}">Continue</a>
                  <button class="btn danger" data-unenroll="${c.id}">Unenroll</button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}</div>`;
      }
    } else if (hash === 'admin') {
      const isAdmin = state.user && state.user.role === 'admin';
      if (!isAdmin) html = `<div class="empty">Admin access only. Sign in as Admin.</div>`;
      else html = `
        <div class="toolbar"><h2>Admin</h2></div>
        <div class="card"><div class="body">
          <div class="field"><span>Users (local only)</span><div>${state.user ? state.user.name : 'None'}</div></div>
          <div class="spacer-sm"></div>
          <div class="field"><span>Total Courses</span><div>${window.LMS_DATA.courses.length}</div></div>
        </div></div>`;
    } else {
      // dashboard
      html = `
        <div class="toolbar"><h2>Welcome ${state.user ? state.user.name : 'Learner'}</h2></div>
        <div class="grid">
          ${window.LMS_DATA.courses.slice(0, 3).map(c => `
            <div class="col-4 col-6 col-12">
              <div class="card">
                <div class="cover"></div>
                <div class="body">
                  <div class="title">${c.title}</div>
                  <div class="meta">By ${c.author} • ${formatMinutes(c.durationMinutes)}</div>
                  <div class="spacer-sm"></div>
                  <a class="btn primary" href="#/courses/${c.id}">Start</a>
                </div>
              </div>
            </div>`).join('')}
        </div>`;
    }
    view.innerHTML = html;
    setBusy(false);

    // Attach dynamic handlers
    qsa('[data-enroll]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-enroll');
      state.enrollments.add(id); saveEnrollments(); render();
    }));
    qsa('[data-unenroll]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-unenroll');
      state.enrollments.delete(id); saveEnrollments(); render();
    }));
    const enrollBtn = qs('#enrollBtn');
    if (enrollBtn) enrollBtn.addEventListener('click', () => {
      const [, id] = (state.route || '').replace('#/courses/', '').split('/');
      if (id) { state.enrollments.add(id); saveEnrollments(); render(); }
    });
  }

  function onRouteChange() {
    state.route = window.location.hash || '#/dashboard';
    setActiveNav();
    render();
  }

  function initHeader() {
    els.globalSearch = qs('#globalSearch');
    els.userButton = qs('#userMenuButton');
    els.userMenu = qs('#userMenu');
    els.openSignIn = qs('#openSignIn');
    els.signOut = qs('#signOut');
    els.userNameLabel = qs('#userNameLabel');
    els.userInitials = qs('#userInitials');
    const sidebarToggle = qs('#sidebarToggle');
    const sidebar = qs('#sidebar');

    sidebarToggle.addEventListener('click', () => {
      const showing = sidebar.style.display !== 'none';
      sidebar.style.display = showing ? 'none' : 'block';
    });

    els.globalSearch.addEventListener('input', (e) => {
      state.query = (e.target.value || '').trim().toLowerCase();
      if (!location.hash.startsWith('#/courses')) location.hash = '#/courses';
      else render();
    });

    function setUserUi() {
      const name = state.user ? state.user.name : 'Sign in';
      els.userNameLabel.textContent = name;
      els.userInitials.textContent = state.user ? (name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()) : '👤';
      qs('.admin-only').style.display = state.user && state.user.role === 'admin' ? '' : 'none';
      els.openSignIn.hidden = !!state.user;
      els.signOut.hidden = !state.user;
    }

    // Menu
    els.userButton.addEventListener('click', () => {
      const open = els.userMenu.classList.toggle('open');
      els.userButton.setAttribute('aria-expanded', String(open));
      els.userMenu.setAttribute('aria-hidden', String(!open));
    });
    document.addEventListener('click', (e) => {
      if (!els.userButton.contains(e.target) && !els.userMenu.contains(e.target)) {
        els.userMenu.classList.remove('open');
        els.userButton.setAttribute('aria-expanded', 'false');
        els.userMenu.setAttribute('aria-hidden', 'true');
      }
    });

    // Sign in dialog
    const dialog = qs('#signInDialog');
    const openDialog = () => dialog.showModal();
    const closeDialog = () => dialog.close();
    els.openSignIn.addEventListener('click', openDialog);
    els.signOut.addEventListener('click', () => { state.user = null; saveUser(); setUserUi(); });
    qs('#signInForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = qs('#signInName').value.trim();
      const role = qs('#signInRole').value;
      if (!name) return;
      state.user = { name, role };
      saveUser();
      setUserUi();
      closeDialog();
    });

    setUserUi();
  }

  function init() {
    restoreUser();
    renderSidebarCourses();
    initHeader();
    setActiveNav();
    render();
  }

  window.addEventListener('hashchange', onRouteChange);
  document.addEventListener('DOMContentLoaded', init);
})();


