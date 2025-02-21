import { Vector2Like } from 'some-utils-ts/types';
/**
 * The base class for all info classes. "Info" classes are used to store
 * information about an event or a state. They should be considered as read-only.
 * If some information needs to saved somewhere (eg. for comparison), it should
 * be cloned first since the source may change.
 */
export declare class InfoBase {
    clone(): Readonly<this>;
}
/**
 * The base class for all pointer info classes.
 *
 * If the getters are implemented the class can provide the following information:
 * - `localPosition`: The position of the pointer relative to the target element.
 */
export declare class PointerInfoBase {
    position: DOMPoint;
    get targetElement(): Element;
    /**
     * The button that was pressed.
     * [mdn](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button)
     */
    get button(): number;
    /**
     * Returns the position of the pointer relative to the target element.
     */
    getLocalPosition<T extends Vector2Like>(out?: T): T;
    get localPosition(): DOMPoint;
    getRelativeLocalPosition<T extends Vector2Like>(out?: T): T;
    get relativeLocalPosition(): DOMPoint;
}
