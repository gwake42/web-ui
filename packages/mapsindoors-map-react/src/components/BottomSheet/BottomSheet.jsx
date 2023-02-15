import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { ContainerContext } from './ContainerContext';
import Sheet from './Sheet/Sheet';
import './BottomSheet.scss';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';

const BOTTOM_SHEETS = {
    LOCATION_DETAILS: 0,
    WAYFINDING: 1
};

/**
 * @param {Object} props
 * @param {Object} props.currentLocation - The currently selected MapsIndoors Location.
 * @param {function} props.onClose - Callback that fires when all bottom sheets are closed.
 */
function BottomSheet({ currentLocation, onClose }) {

    const bottomSheetRef = useRef();
    const [activeBottomSheet, setActiveBottomSheet] = useState(null);

    /**
     * When a sheet is closed.
     */
    function close() {
        setActiveBottomSheet(null);
        onClose();
    }

    /*
     * React on changes on the current location.
     */
    useEffect(() => {
        setActiveBottomSheet(currentLocation ? BOTTOM_SHEETS.LOCATION_DETAILS : undefined);
    }, [currentLocation]);

    const bottomSheets = [
        <Sheet minHeight="128" isOpen={activeBottomSheet === BOTTOM_SHEETS.LOCATION_DETAILS} key="A">
            <LocationDetails onStartWayfinding={() => setActiveBottomSheet(BOTTOM_SHEETS.WAYFINDING)} location={currentLocation} onClose={() => close()} />
        </Sheet>,
        <Sheet minHeight="60" isOpen={activeBottomSheet === BOTTOM_SHEETS.WAYFINDING} key="B">
            <Wayfinding onClose={close} onBack={() => setActiveBottomSheet(BOTTOM_SHEETS.LOCATION_DETAILS)} />
        </Sheet>
    ]

    return <div ref={bottomSheetRef} className='bottom-sheets'>
        <ContainerContext.Provider value={bottomSheetRef}>
            {bottomSheets}
        </ContainerContext.Provider>
    </div>
}

export default BottomSheet;