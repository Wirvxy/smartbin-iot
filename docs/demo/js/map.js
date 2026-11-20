/*
 * Shared Leaflet setup for the dashboard maps.
 * - Starts on Fès and never leaves Morocco.
 * - Uses the light CARTO basemap, and switches to the standard OpenStreetMap tiles
 *   if CARTO can't be reached (blocked network, outage), so the map never stays blank.
 */
(function () {
    const FES = [34.0331, -5.0003];
    const MOROCCO = [[20.5, -17.6], [36.2, -0.9]];

    function addTiles(map) {
        const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO', subdomains: 'abcd', maxZoom: 19
        });
        let errors = 0, loaded = 0, switched = false;
        carto.on('tileload', () => { loaded++; });
        carto.on('tileerror', () => {
            errors++;
            if (switched || loaded > 0 || errors < 3) return;
            switched = true;
            map.removeLayer(carto);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
            }).addTo(map);
        });
        carto.addTo(map);
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
