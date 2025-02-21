export declare enum PointerButton {
    Main = 0,
    Aux = 1,
    Second = 2,
    Fourth = 3,
    Fifth = 4,
    DoubleTouch = 5,
    /**
     * Left button.
     * @alias PointerButton.Main
     */
    Left = 0,
    /**
     * Middle button.
     * @alias PointerButton.Aux
     */
    Middle = 1,
    /**
     * Right button.
     * @alias PointerButton.Second
     */
    Right = 2
}
export type PointerTarget = HTMLElement | SVGElement | any;
declare const eventPhases: readonly ["start", "continue", "end"];
export type EventPhase = (typeof eventPhases)[number];
export {};
