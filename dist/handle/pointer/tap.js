import { isAncestorOf } from '../../utils/tree.js';
import { PointerInfoBase } from './info.js';
class TapInfo extends PointerInfoBase {
    timestamp;
    tapTarget;
    downTarget;
    downPosition;
    orignalDownEvent;
    originalUpEvent = null;
    constructor(timestamp, tapTarget, downTarget, downPosition, orignalDownEvent) {
        super();
        this.timestamp = timestamp;
        this.tapTarget = tapTarget;
        this.downTarget = downTarget;
        this.downPosition = downPosition;
        this.orignalDownEvent = orignalDownEvent;
        this.position = downPosition;
    }
    get targetElement() {
        return this.tapTarget;
    }
    get button() {
        return this.orignalDownEvent.button;
    }
    getLocalDownPosition(out) {
        const { x, y } = this.localPosition;
        out ??= {};
        out.x = x;
        out.y = y;
        return out;
    }
    get localDownPosition() {
        return this.localPosition;
    }
}
const defaultParams = {
    /** The max distance that the user may travel when down. */
    maxDistance: 10,
    /** The max duration that the user may stay down (seconds). */
    maxDuration: .3,
};
const callbackNames = [
    'onTap',
];
function hasTapCallback(params) {
    return callbackNames.some(name => name in params);
}
function handleTap(element, params) {
    const { maxDistance, maxDuration, onTap, } = { ...defaultParams, ...params };
    let info = null;
    const onPointerDown = (event) => {
        info = new TapInfo(Date.now(), element, event.target, new DOMPoint(event.clientX, event.clientY), event);
        window.addEventListener('pointerup', onPointerUp);
    };
    const onPointerUp = (event) => {
        window.removeEventListener('pointerup', onPointerUp);
        if (isAncestorOf(info.downTarget, event.target)) {
            const duration = (Date.now() - info.timestamp) / 1e3;
            if (duration <= maxDuration) {
                const x = event.clientX - info.downPosition.x;
                const y = event.clientY - info.downPosition.y;
                const distance = Math.hypot(x, y);
                if (distance <= maxDistance) {
                    info.originalUpEvent = event;
                    // Call the callback in the next frame to avoid collision with other events (native eg: 'click', or custom)
                    window.requestAnimationFrame(() => {
                        onTap?.(info);
                    });
                }
            }
        }
    };
    element.addEventListener('pointerdown', onPointerDown);
    return () => {
        element.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', onPointerUp);
    };
}
export { handleTap, hasTapCallback };
