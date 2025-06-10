import { PointerTarget } from './type';
declare class OutsideInfo {
}
type Callback = (info: OutsideInfo) => void;
declare const defaultParams: {
    /** The max distance that the user may travel when down. */
    maxDistance: number;
    /** The max duration that the user may stay down (seconds). */
    maxDuration: number;
};
declare const callbackNames: readonly ["onDownOutside"];
type CallbackName = (typeof callbackNames)[number];
type Params = Partial<typeof defaultParams & Record<CallbackName, Callback>>;
declare function hasOutsideCallback(params: Record<string, any>): boolean;
declare function handleOutside(element: PointerTarget, params: Params): () => void;
export type { Params as HandleOutsideParams, OutsideInfo };
export { handleOutside, hasOutsideCallback };
