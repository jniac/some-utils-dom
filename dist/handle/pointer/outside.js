class OutsideInfo {
}
const defaultParams = {
    /** The max distance that the user may travel when down. */
    maxDistance: 10,
    /** The max duration that the user may stay down (seconds). */
    maxDuration: .3,
};
const callbackNames = [
    'onDownOutside',
];
function hasOutsideCallback(params) {
    return callbackNames.some(name => name in params);
}
function handleOutside(element, params) {
    const onPointerDown = (event) => {
        const outside = event.target !== element && element.contains(event.target) === false;
        if (outside && params.onDownOutside) {
            const info = new OutsideInfo();
            params.onDownOutside(info);
        }
    };
    document.body.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => {
        document.body.removeEventListener('pointerdown', onPointerDown);
    };
}
export { handleOutside, hasOutsideCallback };
