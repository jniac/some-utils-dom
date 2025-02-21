import { InfoBase } from './info';
import { EventPhase, PointerTarget } from './type';
declare class WheelFrameInfo extends InfoBase {
    time: number;
    deltaTime: number;
    delta: DOMPoint;
    phase: EventPhase;
    constructor(time?: number, deltaTime?: number, delta?: DOMPoint, phase?: EventPhase);
}
type Callback = (info: WheelFrameInfo) => void;
declare const defaultParams: {
    /**
     * Whether to prevent the default behavior of the wheel event.
     */
    preventDefault: boolean;
    /**
     * The order in which the drag callback is called.
     *
     * If undefined, the drag callback is called by using window.requestAnimationFrame.
     * Otherwise, the drag callback is called by using Ticker.current().requestAnimationFrame
     * with the given order.
     */
    wheelFrameTickOrder: number | undefined;
};
declare const callbackNames: readonly ["onWheelFrame", "onWheelFrameStart", "onWheelFrameEnd"];
type CallbackName = (typeof callbackNames)[number];
type Params = Partial<typeof defaultParams & Record<CallbackName, Callback>>;
declare function hasWheelFrameCallback(params: Record<string, any>): boolean;
/**
 * Absolutely WIP. Here's just a draft.
 * Do not use this.
 * But fix/complete it.
 */
declare function handleWheelFrame(element: PointerTarget, params: Params): () => void;
export type { Params as HandleWheelFrameParams };
export { handleWheelFrame, hasWheelFrameCallback };
