/*
 * SmartBin online demo (GitHub Pages).
 * The pages are snapshots of the real dashboard rendered by the backend in "demo" mode.
 * This script stands in for the server:
 *  - answers the dashboard's live-data request from a local copy of the bins,
 *  - simulates the LoRa sensor on BIN-0001 (it fills up, like SensorSimulator.java),
 *  - lets "Marquer collecté" and "Fermer l'alerte" work for this browser tab,
 *  - turns links to /containers/3 etc. into the matching snapshot pages,
 *  - explains that the other actions need the real backend.
 * Nothing is sent anywhere; the state lives in sessionStorage.
 */
(function () {
    const DATA = window.SMARTBIN_DEMO;
    const KEY = 'smartbin-demo-v1';
    const SENSOR_ID = 1;           // BIN-0001, fed by the simulated sensor node
    const SENSOR_STEP = 2;         // % per reading
    const SENSOR_PERIOD = 5000;    // one reading every 5 s

    function load() {
        try {
            const s = JSON.parse(sessionStorage.getItem(KEY));
            if (s && s.v === DATA.generatedAt) return s;
        } catch (e) { /* fresh state below */ }
        const sensor = DATA.containers.find(c => c.id === SENSOR_ID);
        return { v: DATA.generatedAt, collected: {}, resolved: [], sensor: { base: sensor ? sensor.fillPercentage : 0, t0: Date.now() } };
    }
    function save(s) { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } }
    const state = load();

    function sensorFill() {
        const steps = Math.floor((Date.now() - state.sensor.t0) / SENSOR_PERIOD);
        let fill = state.sensor.base + steps * SENSOR_STEP;
        if (fill >= 100) { state.sensor = { base: 0, t0: Date.now() }; save(state); fill = 0; }
        return fill;
    }

    function containers() {
        return DATA.containers.map(c => {
            const copy = Object.assign({}, c);
            if (c.id === SENSOR_ID) copy.fillPercentage = sensorFill();
            else if (state.collected[c.id]) copy.fillPercentage = 0;
            copy.currentLevel = (copy.capacity || 0) * copy.fillPercentage / 100;
            copy.alertTriggered = copy.fillPercentage >= (copy.alertThreshold || 80);
            return copy;
        });
    }

    function openAlerts() {
        return DATA.alerts.filter(a => !state.resolved.includes(a.id) && !state.collected[a.containerId]);
    }

    // 1. Live data for the overview page.
    const realFetch = window.fetch.bind(window);
    window.fetch = function (url, opts) {
        const u = typeof url === 'string' ? url : url.url;
        if (u.indexOf('/dashboard/data/containers') !== -1) {
            return Promise.resolve(new Response(JSON.stringify(containers()), { headers: { 'Content-Type': 'application/json' } }));
        }
        return realFetch(url, opts);
    };

    // 2. Links: map the server's URLs to the snapshot files.
    const PAGES = { '/dashboard': 'dashboard.html', '/': 'dashboard.html', '/containers': 'containers.html', '/alerts': 'alerts.html', '/reports': 'reports.html', '/login': 'index.html' };
    function pageFor(href) {
        if (!href || href.charAt(0) !== '/') return null;
        const path = href.split('?')[0].split('#')[0];
        if (PAGES[path]) return PAGES[path];
        const m = path.match(/^\/containers\/(\d+)$/);
        if (m && DATA.containers.some(c => String(c.id) === m[1])) return 'container-' + m[1] + '.html';
        return false;
    }

    function toast(text) {
        let t = document.getElementById('demo-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'demo-toast';
            t.setAttribute('role', 'status');
            document.body.appendChild(t);
        }
        t.textContent = text;
        t.classList.add('is-visible');
        clearTimeout(t._timer);
        t._timer = setTimeout(() => t.classList.remove('is-visible'), 3600);
    }
    const NOT_HERE = "Cette action a besoin du vrai serveur. Lancez le projet en local pour l'essayer (voir le README).";

    document.addEventListener('click', e => {
        const a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        const target = pageFor(a.getAttribute('href'));
        if (target === null) return;              // external or relative link: leave it
        e.preventDefault();
        if (target) location.href = target; else toast(NOT_HERE);
    }, true);

    // 3. Forms.
    document.addEventListener('submit', e => {
        const form = e.target;
        const action = form.getAttribute('action') || '';
        e.preventDefault();
        let m;
        if (action === '/login') { location.href = 'dashboard.html'; return; }
        if (action === '/logout') { sessionStorage.removeItem(KEY); location.href = 'index.html?logout=true'; return; }
        if ((m = action.match(/^\/containers\/(\d+)\/collect$/))) {
            const id = Number(m[1]);
            if (id === SENSOR_ID) state.sensor = { base: 0, t0: Date.now() };
            else state.collected[id] = true;
            save(state);
            const back = form.querySelector('input[name="back"]');
            location.href = back && back.value === 'dashboard' ? 'dashboard.html' : 'container-' + id + '.html';
            return;
        }
        if ((m = action.match(/^\/alerts\/(\d+)\/resolve$/))) {
            state.resolved.push(Number(m[1]));
            save(state);
            const row = form.closest('tr');
            if (row) row.remove();
            refreshChrome();
            toast('Alerte fermée (dans cette démo seulement).');
            return;
        }
        toast(NOT_HERE);
    }, true);

    // 4. Keep the alerts counter and the alerts page in line with what was done in this tab.
    function refreshChrome() {
        const open = openAlerts();
        const badge = document.querySelector('.topnav .count');
        if (badge) {
            if (open.length) { badge.textContent = open.length; badge.style.display = ''; }
            else badge.style.display = 'none';
        }
        document.querySelectorAll('[data-alert-id]').forEach(row => {
            if (!open.some(a => String(a.id) === row.getAttribute('data-alert-id'))) row.remove();
        });
        const table = document.querySelector('[data-alerts-table]');
        if (table && !table.querySelector('tbody tr')) {
            table.outerHTML = '<div style="padding: 28px 24px;"><p style="font: 600 22px/1.2 var(--font-display);">Aucune alerte ouverte.</p>'
                + '<p class="empty">Tous les bacs sont sous leur seuil. <a href="/dashboard">Retour à la vue d\'ensemble</a></p></div>';
        }
    }

    function banner() {
        const b = document.createElement('div');
        b.className = 'demo-banner';
        b.innerHTML = 'Démo en ligne : données fictives à Fès, rien n\'est enregistré. '
            + '<a href="https://github.com/Wirvxy/smartbin-iot">Code source et installation</a>';
        const top = document.querySelector('.topbar');
        if (top) top.insertAdjacentElement('afterend', b);
        else document.body.insertAdjacentElement('afterbegin', b);
    }

    document.addEventListener('DOMContentLoaded', () => {
        banner();
        refreshChrome();
        const user = document.getElementById('username');
        if (user) { user.value = 'admin'; document.getElementById('password').value = 'admin123'; }
    });
})();
