import { Vector2Like } from 'some-utils-ts/types';
import { PointerInfoBase } from './info';
import { PointerTarget } from './type';
declare class TapInfo extends PointerInfoBase {
    readonly timestamp: number;
    readonly tapTarget: HTMLElement | SVGElement;
    readonly downTarget: HTMLElement | SVGElement;
    readonly downPosition: DOMPoint;
    readonly orignalDownEvent: PointerEvent;
    originalUpEvent: PointerEvent;
    constructor(timestamp: number, tapTarget: HTMLElement | SVGElement, downTarget: HTMLElement | SVGElement, downPosition: DOMPoint, orignalDownEvent: PointerEvent);
    get targetElement(): HTMLElement | SVGElement;
    get button(): number;
    getLocalDownPosition<T extends Vector2Like>(out?: T): T;
    get localDownPosition(): DOMPoint;
}
type Callback = (info: TapInfo) => void;
declare const defaultParams: {
    /** The max distance that the user may travel when down. */
    maxDistance: number;
    /** The max duration that the user may stay down (seconds). */
    maxDuration: number;
};
declare const callbackNames: readonly ["onTap"];
type CallbackName = (typeof callbackNames)[number];
type Params = Partial<typeof defaultParams & Record<CallbackName, Callback>>;
declare function hasTapCallback(params: Record<string, any>): boolean;
declare function handleTap(element: PointerTarget, params: Params): () => void;
export type { Params as HandleTapParams, TapInfo };
export { handleTap, hasTapCallback };
