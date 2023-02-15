import { useContext, useEffect } from 'react';
import { useRef, useState } from 'react';
import { ContainerContext } from '../ContainerContext';
import { useSwipeable } from 'react-swipeable';
import './Sheet.scss';

const sizes = {
    MIN: 1, // Sheet height is the minimum height
    FIT: 2, // Sheet height fits to the content
    MAX: 3  // Sheet height is of maximum height (height of container element)
};
let dragStartHeight;

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - If the sheet is open (visible) or not.
 * @param {number} props.minheight - The minimum height of the sheet. It cannot be resized to below this height.
 */
function Sheet({ children, isOpen, minHeight }) {


    const sheetRef = useRef();
    const contentRef = useRef();
    const [size, setSize] = useState(sizes.FIT);
    const [isDragging, setIsDragging] = useState(false);
    const [dragDirection, setDragDirection] = useState();

    const container = useContext(ContainerContext);

    const [style, setStyle] = useState({});
    const [contentHeight, setContentHeight] = useState();

    /**
     * Change the height of the sheet to one of the preset sizes (min, fit, max).
     *
     * @param {number} targetSize - Which of the sizes to change to.
     */
    function changeSheetHeight(targetSize) {
        // Prevent going to minimum size state if the content size is the same in order to prevent the need for double swipes to change height.
        if (targetSize === sizes.MIN && contentHeight <= minHeight) {
            return;
        }

        if (size === sizes.FIT) {
            sheetRef.current.style.height = `${contentHeight}px`;
        }

        // RequestAnimationFrame needed in order to the above height to kick in thus enabling the transition of height.
        // Inspired by https://css-tricks.com/using-css-transitions-auto-dimensions/#aa-technique-3-javascript
        requestAnimationFrame(() => {
            switch (targetSize) {
                case sizes.MAX:
                    setStyle({ height: `${container.current.clientHeight}px`});
                    break;
                case sizes.FIT:
                    setStyle({ height: `${contentHeight}px`});
                    break;
                case sizes.MIN:
                    setStyle({ height: `${minHeight}px` });
                    break;
                default:
                    break;
            }
            setSize(targetSize);
        });
    }

    /**
     * Handler for swipe gestures.
     */
    const swipeHandler = useSwipeable({
        onSwipeStart: (e) => {
            setIsDragging(true);
            setDragDirection(e.dir);
            dragStartHeight = sheetRef.current.clientHeight;
        },
        onSwiping: (e) => {
            const newHeight = Math.max(dragStartHeight - e.deltaY, minHeight);
            setStyle({ height: `${newHeight}px` });
        },
        onSwiped: (e) => {
            const newHeight = Math.max(dragStartHeight - e.deltaY, minHeight);
            setIsDragging(false);

            // Find closest snap point (min, fit or max) and snap to that
            let minThreshold, maxThreshold;

            // FIXME: Choose an approach:

            // Naïve approach: 50% of difference between snap points
            // minThreshold = (contentHeight - parseInt(minHeight)) / 2 + parseInt(minHeight);
            // maxThreshold = (container.current.clientHeight - contentHeight) / 2 + contentHeight;

            // Another approach: 60px going in the direction of the swipe
            if (dragDirection.toUpperCase() === 'DOWN') {
                minThreshold = contentHeight - 60;
                maxThreshold = container.current.clientHeight - 60;
            } else {
                minThreshold = parseInt(minHeight) + 60;
                maxThreshold = contentHeight + 60;
            }

            if (newHeight <= minThreshold) {
                changeSheetHeight(sizes.MIN);
            } else if (newHeight <= maxThreshold) {
                changeSheetHeight(sizes.FIT);
            } else {
                changeSheetHeight(sizes.MAX);
            }
        },
        trackMouse: true,
        preventScrollOnSwipe: true
    });

    /*
     * Handle sheet height when children or isOpen change.
     */
    useEffect(() => {
        if (isOpen === false) {
            setContentHeight();
            sheetRef.current.style.height = '';
        } else {
            setContentHeight(contentRef.current.clientHeight);
        }
    }, [children, isOpen]);

    /*
     * Pass through ref to share the ref between component and useSwipeable.
     */
    const refPassthrough = el => {
        swipeHandler.ref(el);
        sheetRef.current = el;
    };

    return <div {...swipeHandler} ref={refPassthrough} style={style} className={`sheet ${isOpen ? 'sheet--active' : ''} ${isDragging ? 'sheet--dragging': ''}`}>
        <div ref={contentRef} className="sheet__content">
            {children}
        </div>
    </div>
}

export default Sheet;