import { useEffect, useState } from 'react';
import Modal from './Modal/Modal';
import LocationDetails from "../LocationDetails/LocationDetails";
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import Search from '../Search/Search';
import LocationsList from '../LocationsList/LocationsList';

const VIEWS = {
    SEARCH: 0,
    LOCATIONS_LIST: 1,
    LOCATION_DETAILS: 2,
    WAYFINDING: 3,
    DIRECTIONS: 4
};

/**
 * @param {Object} props
 * @param {Object} props.currentLocation - The currently selected MapsIndoors Location.
 * @param {Object} props.setCurrentLocation - The setter for the currently selected MapsIndoors Location.
 * @param {Object} props.currentCategories - The unique categories displayed based on the existing locations.
 * @param {function} props.onLocationsFiltered - The list of locations after filtering through the categories.
 * @param {function} props.onDirectionsOpened - Check if the directions page state is open.
 * @param {function} props.onDirectionsClosed - Check if the directions page state is closed.
 * @param {string} props.currentVenueName - The currently selected venue.
 * @param {array} props.filteredLocationsByExternalIDs - Array of locations filtered based on the external ID.
 * @param {function} props.onLocationsFilteredByExternalIDs - The list of locations after filtering based on external ID.
 *
*/
function Sidebar({ currentLocation, setCurrentLocation, currentCategories, onLocationsFiltered, onDirectionsOpened, onDirectionsClosed, currentVenueName, filteredLocationsByExternalIDs, onLocationsFilteredByExternalIDs }) {
    const [activePage, setActivePage] = useState(null);

    const [directions, setDirections] = useState();

    /*
     * React on changes on the current location and the locations filtered by external ID.
     */
    useEffect(() => {
        if (filteredLocationsByExternalIDs?.length > 0) {
            setActivePage(currentLocation ? VIEWS.LOCATION_DETAILS : VIEWS.LOCATIONS_LIST);
        } else {
            setActivePage(currentLocation ? VIEWS.LOCATION_DETAILS : VIEWS.SEARCH);
        }
    }, [currentLocation, filteredLocationsByExternalIDs]);

    /**
     * Set the active page and trigger the visibility of the floor selector to be shown.
     *
     * @param {number} page
     */
    function setPage(page) {
        setActivePage(page);
        onDirectionsClosed();
    }

    /**
     * Navigate to the directions page and trigger the visibility of the floor selector to be hidden.
     */
    function setDirectionsPage() {
        setActivePage(VIEWS.DIRECTIONS);
        onDirectionsOpened();
    }

    /**
     * Close the location details page and navigate to either the Locations list page or the Search page.
     */
    function closeLocationDetails() {
        if (filteredLocationsByExternalIDs?.length > 0) {
            setActivePage(VIEWS.LOCATIONS_LIST);
            setCurrentLocation();
        } else {
            setActivePage(VIEWS.SEARCH);
            setCurrentLocation();
        }
    }

    /**
     * Close the Locations list page and navigate to the Search page, resetting the filtered locations.
     */
    function closeLocationsList() {
        setActivePage(VIEWS.SEARCH);
        setCurrentLocation();
        onLocationsFilteredByExternalIDs([]);
    }

    const pages = [
        <Modal isOpen={activePage === VIEWS.SEARCH} key="A">
            <Search
                onLocationClick={(location) => setCurrentLocation(location)}
                categories={currentCategories}
                onLocationsFiltered={(locations) => onLocationsFiltered(locations)}
                currentVenueName={currentVenueName}
            />
        </Modal>,
        <Modal isOpen={activePage === VIEWS.LOCATIONS_LIST} key="B">
            <LocationsList
                onBack={() => closeLocationsList()}
                locations={filteredLocationsByExternalIDs}
                onLocationClick={(location) => setCurrentLocation(location)}
                onLocationsFiltered={(locations) => onLocationsFilteredByExternalIDs(locations)}
            />
        </Modal>,
        <Modal isOpen={activePage === VIEWS.LOCATION_DETAILS} key="C">
            <LocationDetails
                onStartWayfinding={() => setPage(VIEWS.WAYFINDING)}
                location={currentLocation}
                onBack={() => closeLocationDetails()}
            />
        </Modal>,
        <Modal isOpen={activePage === VIEWS.WAYFINDING} key="D">
            <Wayfinding
                onStartDirections={() => setDirectionsPage()}
                location={currentLocation}
                onDirections={result => setDirections(result)}
                onBack={() => setPage(VIEWS.LOCATION_DETAILS)}
                isActive={activePage === VIEWS.WAYFINDING}
            />
        </Modal>,
        <Modal isOpen={activePage === VIEWS.DIRECTIONS} key="E">
            <Directions
                isOpen={activePage === VIEWS.DIRECTIONS}
                directions={directions}
                onBack={() => setPage(VIEWS.WAYFINDING)}
            />
        </Modal>
    ]

    return (
        <div>
            {pages}
        </div>
    )
}

export default Sidebar;