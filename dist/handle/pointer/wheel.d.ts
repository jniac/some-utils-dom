import { InfoBase } from './info';
import { EventPhase, PointerTarget } from './type';
declare class WheelInfo extends InfoBase {
    /** The time of the event, in seconds. */
    time: number;
    /** The raw value of the delta time, based on the event timestamp, and not normalized. */
    rawDeltaTime: number;
    /** The normalized value of the delta time, clamped between 1/120 and 1/30. */
    deltaTime: number;
    delta: DOMPoint;
    phase: EventPhase;
    event: WheelEvent;
}
type Callback = (info: WheelInfo) => void;
declare const defaultParams: {
    wheelPreventDefault: boolean;
};
declare const callbackNames: readonly ["onWheel", "onWheelStart", "onWheelEnd"];
type CallbackName = (typeof callbackNames)[number];
type Params = Partial<typeof defaultParams & Record<CallbackName, Callback>>;
declare function hasWheelCallback(params: Record<string, any>): boolean;
declare function handleWheel(element: PointerTarget, params: Params): () => void;
export type { Params as HandleWheelParams, WheelInfo };
export { handleWheel, hasWheelCallback };
