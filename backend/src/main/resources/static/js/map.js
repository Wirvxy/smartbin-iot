/*
 * Shared Leaflet setup for the dashboard maps.
 * - Starts on Fès and never leaves Morocco.
 * - OpenStreetMap tiles (no API key needed), shown in greyscale by smartbin.css so that
 *   the only colours on the map are the bins' fill states.
 */
(function () {
    const FES = [34.0331, -5.0003];
    const MOROCCO = [[20.5, -17.6], [36.2, -0.9]];

    function addTiles(map) {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);
    }

    function colour(state) {
        const v = state === 'is-full' ? '--full' : state === 'is-soon' ? '--soon' : '--ok';
        return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    }

    window.SmartBinMap = {
        FES,
        /** Creates a map in `el`, centred on Fès, or returns null if Leaflet didn't load. */
        create(el, zoom) {
            if (!window.L) {
                el.innerHTML = '<p class="empty" style="padding: 24px;">La carte n\'a pas pu se charger. Vérifiez la connexion Internet.</p>';
                return null;
            }
            const map = L.map(el, {
                maxBounds: L.latLngBounds(MOROCCO), maxBoundsViscosity: 1.0,
                minZoom: 5, maxZoom: 19, scrollWheelZoom: false
            }).setView(FES, zoom || 13);
            addTiles(map);
            return map;
        },
        /** Round marker coloured like the fill state (is-ok / is-soon / is-full). */
        dot(state) {
            return L.divIcon({
                className: '', iconSize: [16, 16],
                html: `<div class="map-dot" style="--c:${colour(state)}"></div>`
            });
        }
    };
})();
