function cloneValue(value) {
    if (typeof value !== 'object') {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(cloneValue);
    }
    switch (value.constructor) {
        case DOMPoint: {
            return DOMPoint.fromPoint(value);
        }
        case DOMRect: {
            return DOMRect.fromRect(value);
        }
        case Object: {
            const instance = Object.create(value);
            for (const key of Object.keys(value)) {
                instance[key] = cloneValue(value[key]);
            }
            return instance;
        }
    }
    throw new Error(`Unsupported value type: ${value.constructor}`);
}
/**
 * The base class for all info classes. "Info" classes are used to store
 * information about an event or a state. They should be considered as read-only.
 * If some information needs to saved somewhere (eg. for comparison), it should
 * be cloned first since the source may change.
 */
export class InfoBase {
    clone() {
        const instance = Object.create(this);
        for (const [key, value] of Object.entries(this)) {
            instance[key] = cloneValue(value);
        }
        return Object.freeze(instance);
    }
}
/**
 * The base class for all pointer info classes.
 *
 * If the getters are implemented the class can provide the following information:
 * - `localPosition`: The position of the pointer relative to the target element.
 */
export class PointerInfoBase {
    position = new DOMPoint();
    get targetElement() {
        throw new Error('Not implemented');
    }
    /**
     * The button that was pressed.
     * [mdn](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button)
     */
    get button() {
        throw new Error('Not implemented');
    }
    /**
     * Returns the position of the pointer relative to the target element.
     */
    getLocalPosition(out) {
        const rect = this.targetElement.getBoundingClientRect();
        const { x, y } = this.position;
        out ??= {};
        out.x = x - rect.x;
        out.y = y - rect.y;
        return out;
    }
    get localPosition() {
        return this.getLocalPosition(new DOMPoint());
    }
    getRelativeLocalPosition(out) {
        const { x, y } = this.localPosition;
        const rect = this.targetElement.getBoundingClientRect();
        out ??= {};
        out.x = (x - rect.x) / rect.width;
        out.y = (y - rect.y) / rect.height;
        return out;
    }
    get relativeLocalPosition() {
        return this.getRelativeLocalPosition(new DOMPoint());
    }
}
