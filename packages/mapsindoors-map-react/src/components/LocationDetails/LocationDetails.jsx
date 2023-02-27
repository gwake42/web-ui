import React, { useContext, useEffect, useState, useRef } from 'react';
import './LocationDetails.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as PinIcon } from '../../assets/pin.svg';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import { useIsVerticalOverflow } from '../../hooks/useIsVerticalOverflow';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import { snapPoints } from '../BottomSheet/Sheet/Sheet';

function LocationDetails({ location, onClose, onStartWayfinding, onSetSize, snapPointSwiped }) {

    const locationInfoElement = useRef(null);
    const locationDetailsElement = useRef(null);

    const [showFullDescription, setShowFullDescription] = useState(false);

    // Holds the MapsIndoors DisplayRule for the location
    const [locationDisplayRule, setLocationDisplayRule] = useState(null);

    const mapsIndoorsInstance = useContext(MapsIndoorsContext);

    // Check if the content of the Location details is overflowing
    const [isOverflowing, initialOverflow] = useIsVerticalOverflow(location, locationDetailsElement);

    const scrollableContentSwipePrevent = usePreventSwipe();

    useEffect(() => {
        if (location) {
            locationInfoElement.current.location = location;
            setLocationDisplayRule(mapsIndoorsInstance.getDisplayRule(location));
        }
    }, [location, mapsIndoorsInstance]);

    /*
     * When user swipes the bottom sheet to a new snap point.
     */
    useEffect(() => {
        if (snapPointSwiped === undefined) return;

        // If swiping to max height, expand location details.
        // If swiping to smaller height, collapse location details.
        setShowFullDescription(snapPointSwiped === snapPoints.MAX);
    }, [snapPointSwiped]);

    /**
     * Toggle the description.
     */
    function toggleDescription() {
        if (showFullDescription === false) {
            onSetSize(snapPoints.MAX);
            requestAnimationFrame(() => { // Necessary to preserve transition
                setShowFullDescription(true);
            });
        } else {
            onSetSize(snapPoints.FIT);
            setShowFullDescription(false);
        }
    }

    return <div className="location-details">
        {location && <>
            <div className="location-info">
                <div className="location-info__icon">
                    {locationDisplayRule && <img alt="" src={locationDisplayRule.icon} />}
                </div>
                <div className="location-info__content">
                    {location.properties.name}<br />
                    <mi-location-info ref={locationInfoElement} />
                </div>
                <button className="location-info__close" onClick={() => onClose()}>
                    <CloseIcon />
                </button>
            </div>

            <div className="location-details__details">
                {location.properties.imageURL && <img alt="" src={location.properties.imageURL} className="location-details__image" />}

                {Object.keys(location.properties.categories).length > 0 && <p className="location-details__categories">
                    {Object.values(location.properties.categories).map((category, index, array) => {
                        return <React.Fragment key={category}>{category}{index < array.length-1 && <>・</>}</React.Fragment>
                    })}
                </p>}

                {location.properties.description && <section {...scrollableContentSwipePrevent} className={`location-details__description prevent-scroll ${showFullDescription ? 'location-details__description--full' : ''}`}>
                    <div ref={locationDetailsElement}>
                        {location.properties.description}
                    </div>
                    {(isOverflowing || (initialOverflow && showFullDescription)) && (
                        <button onClick={() => toggleDescription()}>
                            {!showFullDescription ? 'Read full description' : 'Close' }
                        </button>
                    )}
                </section>}
            </div>

            <button onClick={() => onStartWayfinding()} className="location-details__wayfinding">
                <PinIcon />
                Start wayfinding
                {/* FIXME: Implement */}
            </button>
        </>}
    </div>
}

export default LocationDetails;