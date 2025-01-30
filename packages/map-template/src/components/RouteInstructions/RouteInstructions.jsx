import { useEffect, useRef, useState } from 'react'
import './RouteInstructions.scss';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ArrowRight } from '../../assets/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '../../assets/arrow-left.svg';
import { useRecoilState, useRecoilValue } from 'recoil';
import directionsResponseState from '../../atoms/directionsResponseState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import activeStepState from '../../atoms/activeStep';
import RouteInstructionsStep from '../WebComponentWrappers/RouteInstructionsStep/RouteInstructionsStep';
import substepsToggledState from '../../atoms/substepsToggledState';
import useSetMaxZoomLevel from '../../hooks/useSetMaxZoomLevel';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import isDestinationStepState from '../../atoms/isDestinationStepState';
import { useIsKioskContext } from '../../hooks/useIsKioskContext';
import PropTypes from 'prop-types';

RouteInstructions.propTypes = {
    steps: PropTypes.array,
    onNextStep: PropTypes.func,
    onPreviousStep: PropTypes.func,
    originLocation: PropTypes.object,
    isOpen: PropTypes.bool,
    onFitCurrentDirections: PropTypes.func
};


/**
 * Route instructions step by step component.
 *
 * @param {Object} props
 * @param {array} props.steps - The steps array passed after the directions are set.
 * @param {function} props.onNextStep - Function handling the navigation to the next step.
 * @param {function} props.onPreviousStep - Function handling the navigation to the previous step.
 * @param {object} props.originLocation - The initial location where the route starts from.
 * @param {boolean} props.isOpen - Indicates if the directions view is open.
 * @param {function} props.onFitCurrentDirections - Function to fit the current directions on the map.
 *
 * @returns
 */
function RouteInstructions({ steps, onNextStep, onPreviousStep, originLocation, isOpen, onFitCurrentDirections }) {

    const { t } = useTranslation();

    const scrollableContentSwipePrevent = usePreventSwipe();

    const routeInstructionsRef = useRef();

    /** Referencing the previous step of each active step */
    const [previous, setPrevious] = useState();

    const [activeStep, setActiveStep] = useRecoilState(activeStepState);

    const [totalSteps, setTotalSteps] = useState();

    const directions = useRecoilValue(directionsResponseState);

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    const substepsOpen = useRecoilValue(substepsToggledState);

    const [, setIsDestinationStep] = useRecoilState(isDestinationStepState);

    const setMaxZoomLevel = useSetMaxZoomLevel();

    const isKioskContext = useIsKioskContext();

    /**
     * Clone the last step in the directions in order to create a destination step.
     * Assign the specific travel mode to the destination step and set the steps to null.
     * Push the destination step at the end of the steps array.
     */
    useEffect(() => {
        const lastStep = steps[steps.length - 1];
        const destinationStep = { ...lastStep }
        destinationStep.travel_mode = 'DESTINATION';
        destinationStep.steps = null;
        steps.push(destinationStep);
        setTotalSteps(steps);
    }, [steps]);

    /**
     * Get the zoom and the center of the destination step.
     */
    useEffect(() => {
        if (isOpen) {
            if (activeStep === totalSteps?.length - 1 && directions?.destinationLocation) {
                // Set the destination step boolean to true
                setIsDestinationStep(true);

                // Get the destination location
                const destinationLocation = directions?.destinationLocation;

                // Center the map to the location coordinates.
                const destinationLocationGeometry = destinationLocation?.geometry.type === 'Point' ? destinationLocation?.geometry.coordinates : destinationLocation?.properties.anchor.coordinates;
                mapsIndoorsInstance.getMapView().setCenter({ lat: destinationLocationGeometry[1], lng: destinationLocationGeometry[0] });

                // Call function to set the map zoom level depeding on the max zoom supported on the solution
                setMaxZoomLevel();
            } else {
                // Reset the destination step boolean to false
                setIsDestinationStep(false);
            }

            // Check if the substeps are closed or open, and trigger the method on the <route-instructions-step> component.
            if (substepsOpen === false) {
                routeInstructionsRef.current?.closeSubsteps();
            } else if (substepsOpen === true) {
                routeInstructionsRef.current?.openSubsteps();
            }
        }
    }, [isOpen, activeStep, totalSteps, substepsOpen]);

    /**
     * Navigate to the next step.
     * Set the previous step in order to show the correct
     * instruction and travel mode.
     */
    function nextStep() {
        setPrevious(totalSteps[activeStep]);
        setActiveStep(activeStep + 1);
        onNextStep();
    }

    /**
     * Navigate to the previous step.
     * Set the previous step in order to show the correct
     * instruction and travel mode.
     */
    function previousStep() {
        setPrevious(totalSteps[activeStep - 2]);
        setActiveStep(activeStep - 1);

        if (activeStep === totalSteps?.length - 1) {
            // If coming from the "You have arrived step", reset direction bounds.
            onFitCurrentDirections();
        } else {
            onPreviousStep();
        }
    }

    return (
        <div className="route-instructions prevent-scroll" {...scrollableContentSwipePrevent}>
            {totalSteps &&
                <>
                    <RouteInstructionsStep
                        totalSteps={totalSteps}
                        activeStep={activeStep}
                        previous={previous}
                        directions={directions}
                        originLocation={originLocation}
                        ref={routeInstructionsRef}
                    >
                    </RouteInstructionsStep>
                    <div className={`route-instructions__footer ${!isKioskContext ? '' : 'route-instructions__footer--kiosk'}`}>
                        <div className="route-instructions__actions">
                            <button className={`route-instructions__button ${!isKioskContext ? '' : 'route-instructions__button--kiosk'}`}
                                onClick={() => previousStep()}
                                aria-label={t('Previous')}
                                disabled={activeStep === 0}>
                                <ArrowLeft></ArrowLeft>
                            </button>
                            <div className="route-instructions__overview">{t('StepYofX', { activeStep: activeStep + 1, totalSteps: totalSteps.length })}</div>
                            <button className={`route-instructions__button ${!isKioskContext ? '' : 'route-instructions__button--kiosk'}`}
                                onClick={() => nextStep()}
                                aria-label={t('Next')}
                                disabled={activeStep === totalSteps.length - 1}>
                                <ArrowRight></ArrowRight>
                            </button>
                        </div>
                    </div>
                </>
            }
        </div>
    )
}

export default RouteInstructions