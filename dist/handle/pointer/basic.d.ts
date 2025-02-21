import { PointerInfoBase } from './info';
import { PointerTarget } from './type';
declare class BasicPointerInfo extends PointerInfoBase {
    entered: boolean;
    pressed: boolean;
    downPosition: DOMPoint;
    upPosition: DOMPoint;
    event: Event;
    constructor(entered?: boolean, pressed?: boolean, downPosition?: DOMPoint, upPosition?: DOMPoint, event?: Event);
    get targetElement(): Element;
    /**
     * [mdn](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button)
     */
    get button(): number;
    get localPosition(): DOMPoint;
}
type Callback = (info: BasicPointerInfo) => void;
declare const defaultParams: {};
declare const callbackNames: readonly ["onDown", "onUp", "onChange", "onEnter", "onLeave"];
type CallbackName = (typeof callbackNames)[number];
type Params = Partial<typeof defaultParams & Record<CallbackName, Callback>>;
declare function hasBasicPointerCallback(params: Record<string, any>): boolean;
/**
 * MEMO:
 *  - "pointer" events are fire BEFORE any "mouse" or "touch" events, order is:
 *    - pointer -> touch -> mouse
 *
 * For multiple reasons related to the "mouse" & "touch" reunification,
 * "mouse" & "touch" are handled separately (that is to say: not through the
 * common "pointer" interface).
 *
 * Reasons are:
 * - when tracking pointer position "onChange" callback is better than an "onMove"
 *   because "onMove" (onMouseMove + onPointerMove) is not fired when a new touch
 *   started (but a new touch start implies generally a new position).
 * - "onChange" has to be called before "onDown" (ex: for updating a raycaster),
 *   so this requires to use the "mousedown" & "touchstart" and not "pointer"
 *   since ("pointer" are fired first, "touchstart" will necesseray be late).
 *
 * NOTE:
 *
 * A special effort is made to handle to avoid double "down/up" calls when "touch"
 * events are fired (when "touch" events are fired, "mouse" events are also fired).
 * Since in debug mode, it is possible to switch between "touch" & "mouse" events
 * an heuristic is used that combine "touch started" state and "touch timestamp".
 * This allows to go back and forth between "touch" & "mouse" events without
 * reloading the page.
 */
declare function handleBasicPointer(element: PointerTarget, params: Params): () => void;
export type { BasicPointerInfo, Params as HandleBasicPointerParams };
export { handleBasicPointer, hasBasicPointerCallback };
