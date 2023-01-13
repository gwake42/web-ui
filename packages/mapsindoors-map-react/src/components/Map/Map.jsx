import { useEffect, useState } from "react";
import GoogleMapsMap from "./GoogleMapsMap/GoogleMapsMap";
import MapboxMap from "./MapboxMap/MapboxMap";

const mapsindoors = window.mapsindoors;

const MAP_TYPES = {
    GOOGLE: 'google',
    MAPBOX: 'mapbox'
};

const localStorageKeyForVenue = 'MI-MAP-TEMPLATE-LAST-VENUE';

/**
 * Get the venue to show initally on the map.
 *
 * @param {string} preferredVenueName
 * @returns {object} - venue
 */
async function getVenueToShow(preferredVenueName) {
    const venues = await mapsindoors.services.VenuesService.getVenues();

    // If there's only one venue, early return with that.
    if (venues.length === 1) {
        return venues[0];
    }

    // If last selected venue is set in localStorage, use that.
    const lastSetVenue = window.localStorage.getItem(localStorageKeyForVenue);
    if (lastSetVenue) {
        const venue = venues.find(v => v.name === lastSetVenue);
        if (venue) {
            return venue;
        }
    }

    // If venue parameter is set on the component, use that.
    if (preferredVenueName) {
        const venue = venues.find(v => v.name === preferredVenueName);
        if (venue) {
            return venue;
        }
    }

    // Else take first venue sorted alphabetically
    return venues.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} )[0];
}

/**
 *
 * @param {Object} props
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map.
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Mapbox map.
 * @param {function} [props.onReady] - Function that will be run when the map is ready
 * @param {string} [props.preferredVenueName] - If you want the map to start at a specific Venue, provide the Venue ID here.
 * @returns
 */
function Map({ gmApiKey, mapboxAccessToken, onReady, preferredVenueName }) {
    const [mapType, setMapType] = useState();

    useEffect(() => {
        if (mapboxAccessToken) {
            setMapType(MAP_TYPES.MAPBOX);
        } else {
            // A Google Maps map will have precedense if no keys or keys for both providers are set.
            setMapType(MAP_TYPES.GOOGLE);
        }
    }, [gmApiKey, mapboxAccessToken]);

    /**
     * Set the venue to show on the map.
     *
     * @param {object} venue
     * @param {object} mapsIndoorsInstance
     */
    const setVenue = (venue, mapsIndoorsInstance) => {
        window.localStorage.setItem(localStorageKeyForVenue, venue.name);
        mapsIndoorsInstance.fitVenue(venue);
    }

    const onMapView = async (mapView) => {
        // Instantiate MapsIndoors instance
        const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
            mapView
        });

        mapsIndoorsInstance.on('ready', onReady);

        const venueToShow = await getVenueToShow(preferredVenueName);
        setVenue(venueToShow, mapsIndoorsInstance);
    };

    return (<div className="full">
        {mapType === MAP_TYPES.GOOGLE && <GoogleMapsMap gmApiKey={gmApiKey} onMapView={onMapView} />}
        {mapType === MAP_TYPES.MAPBOX && <MapboxMap mapboxAccessToken={mapboxAccessToken} onMapView={onMapView} />}
    </div>)
}

export default Map;