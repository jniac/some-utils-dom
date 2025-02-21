import { PointerInfoBase } from './info';
import { PointerTarget } from './type';
type Direction = 'horizontal' | 'vertical';
declare class DragInfo extends PointerInfoBase {
    direction: Direction;
    startPosition: DOMPoint;
    position: DOMPoint;
    positionOld: DOMPoint;
    movement: DOMPoint;
    delta: DOMPoint;
    deltaTime: number;
    shiftKey: boolean;
    metaKey: boolean;
    altKey: boolean;
    ctrlKey: boolean;
    _button: number;
    get button(): number;
}
type Callback = (info: DragInfo) => void;
declare const defaultParams: {
    /**
     * The distance threshold in pixels before the drag gesture is recognized.
     *
     * Defaults to `10`.
     */
    dragDistanceThreshold: number;
    /**
     * Whether the drag gesture should snap to the initial position if the distance threshold is not reached.
     *
     * Defaults to `false`.
     */
    dragSnapToInitialPosition: boolean;
    dragPreventDefault: boolean;
    /**
     * Button mask for the drag gesture.
     */
    dragButton: number;
    dragEaseFactor: number;
    /**
     * The order in which the drag callback is called.
     *
     * If undefined, the drag callback is called by using window.requestAnimationFrame.
     * Otherwise, the drag callback is called by using Ticker.current().requestAnimationFrame
     * with the given order.
     */
    dragTickOrder: number | undefined;
};
declare const callbackNames: readonly ["onDragStart", "onDragStop", "onDrag", "onVerticalDragStart", "onVerticalDragStop", "onVerticalDrag", "onHorizontalDragStart", "onHorizontalDragStop", "onHorizontalDrag"];
type CallbackName = (typeof callbackNames)[number];
type Params = Partial<typeof defaultParams & Record<CallbackName, Callback>>;
declare function hasDragCallback(params: Record<string, any>): boolean;
declare function handleDrag(element: PointerTarget, params: Params): () => void;
export type { DragInfo, Params as HandleDragParams };
export { handleDrag, hasDragCallback };
