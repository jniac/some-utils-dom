import { clamp } from 'some-utils-ts/math/basic';
import { InfoBase } from './info.js';
class WheelInfo extends InfoBase {
    /** The time of the event, in seconds. */
    time = -1;
    /** The raw value of the delta time, based on the event timestamp, and not normalized. */
    rawDeltaTime = -1;
    /** The normalized value of the delta time, clamped between 1/120 and 1/30. */
    deltaTime = -1;
    delta = new DOMPoint();
    phase = 'start';
    event = null;
}
const defaultParams = {
    wheelPreventDefault: false,
};
const callbackNames = [
    'onWheel',
    'onWheelStart',
    'onWheelEnd',
];
function hasWheelCallback(params) {
    return callbackNames.some(name => name in params);
}
function getDeltaScalar(deltaMode) {
    // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
    const DOM_DELTA_PIXEL = 0x0;
    const DOM_DELTA_LINE = 0x1;
    const DOM_DELTA_PAGE = 0x2;
    switch (deltaMode) {
        default:
        case DOM_DELTA_PIXEL: return 1;
        case DOM_DELTA_LINE: return 16;
        case DOM_DELTA_PAGE: return 1000;
    }
}
function handleWheel(element, params) {
    const { wheelPreventDefault, onWheel, onWheelStart, onWheelEnd, } = { ...defaultParams, ...params };
    const state = {
        start: false,
        timeout: -1,
        time: -1,
    };
    const info = new WheelInfo();
    const _onWheel = (event) => {
        if (wheelPreventDefault)
            event.preventDefault();
        const phase = state.start === false
            ? 'start'
            : 'continue';
        const time = event.timeStamp / 1e3;
        const rawDeltaTime = phase === 'start' ? 1 / 60 : time - state.time;
        state.time = time;
        info.event = event;
        info.phase = phase;
        info.time = time;
        const scalar = getDeltaScalar(event.deltaMode);
        info.delta.x = event.deltaX * scalar;
        info.delta.y = event.deltaY * scalar;
        info.delta.z = event.deltaZ * scalar;
        const deltaTime = clamp(rawDeltaTime, 1 / 240, 1 / 30);
        info.rawDeltaTime = rawDeltaTime;
        info.deltaTime = deltaTime;
        if (phase === 'start') {
            state.start = true;
            onWheelStart?.(info);
        }
        onWheel?.(info);
        window.clearTimeout(state.timeout);
        state.timeout = window.setTimeout(() => {
            state.start = false;
            info.phase = 'end';
            info.deltaTime = 0.1;
            info.time = time + 0.1;
            info.delta.x = 0;
            info.delta.y = 0;
            info.delta.z = 0;
            onWheelEnd?.(info);
        }, 100);
    };
    element.addEventListener('wheel', _onWheel, { passive: !wheelPreventDefault });
    return () => {
        element.removeEventListener('wheel', _onWheel);
    };
}
export { handleWheel, hasWheelCallback };
