import { handleBasicPointer, hasBasicPointerCallback } from './pointer/basic.js';
import { handleDrag, hasDragCallback } from './pointer/drag.js';
import { handleFocus, hasFocusCallback } from './pointer/focus.js';
import { handlePress, hasPressCallback } from './pointer/press.js';
import { handleTap, hasTapCallback } from './pointer/tap.js';
import { handleWheel, hasWheelCallback } from './pointer/wheel.js';
import { handleWheelFrame, hasWheelFrameCallback } from './pointer/wheel.frame.js';
export function handlePointer(target, params) {
    const destroyCallbacks = [];
    const targets = 'length' in target ? Array.from(target) : [target];
    for (const target of targets) {
        if (hasBasicPointerCallback(params)) {
            destroyCallbacks.push(handleBasicPointer(target, params));
        }
        if (hasDragCallback(params)) {
            destroyCallbacks.push(handleDrag(target, params));
        }
        if (hasFocusCallback(params)) {
            destroyCallbacks.push(handleFocus(target, params));
        }
        if (hasPressCallback(params)) {
            destroyCallbacks.push(handlePress(target, params));
        }
        if (hasTapCallback(params)) {
            destroyCallbacks.push(handleTap(target, params));
        }
        if (hasWheelCallback(params)) {
            destroyCallbacks.push(handleWheel(target, params));
        }
        if (hasWheelFrameCallback(params)) {
            destroyCallbacks.push(handleWheelFrame(target, params));
        }
    }
    return () => {
        for (const callback of destroyCallbacks) {
            callback();
        }
    };
}
export { PointerButton } from './pointer/type.js';
