import { Rectangle } from 'some-utils-ts/math/geom/rectangle';
import { PointerTarget } from './type';
type PressInfo = {
    position: DOMPoint;
    delta: DOMPoint;
    target: PointerTarget;
    targetRectOnDown: Rectangle;
    pointerIsInside: boolean;
};
type Callback = (info: PressInfo) => void;
declare const callbackNames: readonly ["onPressStart", "onPressStop", "onPressFrame"];
type CallbackName = (typeof callbackNames)[number];
type Params = Partial<Record<CallbackName, Callback>>;
declare function hasPressCallback(params: Record<string, any>): boolean;
declare function handlePress(element: PointerTarget, params: Params): () => void;
export type { Params as HandlePressParams, PressInfo };
export { handlePress, hasPressCallback };
